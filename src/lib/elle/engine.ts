import Anthropic from '@anthropic-ai/sdk'

import type { ChatEvent, ChatRequest } from '@/lib/chat/types'
import { offlineReply } from './offline'
import { FIND_RESOURCES_TOOL_DESCRIPTION, SYSTEM_PROMPT } from './prompt'
import { assessConversation, isAtLeast, type RiskAssessment } from './risk'
import {
  CATEGORY_LABELS,
  cityLabel,
  detectCity,
  EMERGENCY_NUMBERS,
  findResources,
  isCategory,
  isCityId,
  type CityId,
  type HelpResource,
} from './resources'

export const MAX_MESSAGES = 40
export const MAX_MESSAGE_CHARACTERS = 1500
const MAX_TOOL_ROUNDS = 3

export type EngineConfig = {
  client: Anthropic | null
  model: string
  effort: 'low' | 'medium' | 'high'
}

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): EngineConfig {
  const hasCredentials = Boolean(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN)
  const effort = env.ORIAH_ELLE_EFFORT
  return {
    client: hasCredentials ? new Anthropic() : null,
    model: env.ORIAH_ELLE_MODEL || 'claude-opus-5-5',
    effort: effort === 'low' || effort === 'high' ? effort : 'medium',
  }
}

/** Valide le corps de la requête. Renvoie un message d'erreur lisible, ou la requête nettoyée. */
export function parseChatRequest(body: unknown): { ok: true; request: ChatRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Requête invalide.' }
  const { messages, city } = body as { messages?: unknown; city?: unknown }
  if (!Array.isArray(messages) || messages.length === 0) return { ok: false, error: 'Aucun message reçu.' }
  if (messages.length > MAX_MESSAGES) return { ok: false, error: 'Conversation trop longue. Commencez une nouvelle conversation.' }
  const cleaned: ChatRequest['messages'] = []
  for (const message of messages) {
    if (!message || typeof message !== 'object') return { ok: false, error: 'Message invalide.' }
    const { role, content } = message as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return { ok: false, error: 'Rôle de message invalide.' }
    if (typeof content !== 'string') return { ok: false, error: 'Contenu de message invalide.' }
    const trimmed = content.trim()
    if (role === 'user' && trimmed.length > MAX_MESSAGE_CHARACTERS) return { ok: false, error: 'Message trop long.' }
    if (trimmed) cleaned.push({ role, content: trimmed.slice(0, 8000) })
  }
  if (cleaned.at(-1)?.role !== 'user') return { ok: false, error: 'Le dernier message doit venir de l’utilisatrice.' }
  return { ok: true, request: { messages: cleaned, city: isCityId(city) ? city : null } }
}

function contextNote(risk: RiskAssessment, city: CityId | null): string {
  const signals = risk.signals.map((signal) => signal.label).join(', ') || 'aucun'
  return [
    'Contexte calculé automatiquement par Oriah Elle (non visible par l’utilisatrice) :',
    `- Niveau de danger détecté : ${risk.level}. Signaux : ${signals}.`,
    `- Ville : ${city ? cityLabel(city) : 'inconnue'}.`,
    risk.level === 'immediate'
      ? '- Les numéros d’urgence sont déjà affichés en haut de l’écran. Commence ta réponse par la mise en sécurité.'
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

const FIND_RESOURCES_TOOL: Anthropic.Beta.BetaTool = {
  name: 'find_help_resources',
  description: FIND_RESOURCES_TOOL_DESCRIPTION,
  input_schema: {
    type: 'object',
    properties: {
      city: { type: 'string', enum: ['yaounde', 'douala', 'buea', 'bamenda', 'maroua', 'garoua'], description: 'Ville de la personne.' },
      categories: {
        type: 'array',
        items: { type: 'string', enum: Object.keys(CATEGORY_LABELS) },
        description: 'Types de services recherchés. Vide = tous.',
      },
    },
    required: ['city', 'categories'],
    additionalProperties: false,
  },
  strict: true,
  eager_input_streaming: true,
}

/** Exécute l'outil. Les entrées sont revalidées : en streaming, le SDK ne garantit pas leur forme. */
export function runFindResources(input: unknown): { resources: HelpResource[]; summary: string; isError: boolean } {
  const { city, categories } = (input && typeof input === 'object' ? input : {}) as { city?: unknown; categories?: unknown }
  if (!isCityId(city)) {
    return { resources: [], summary: 'Ville inconnue. Villes possibles : yaounde, douala, buea, bamenda, maroua, garoua.', isError: true }
  }
  const validCategories = Array.isArray(categories) ? categories.filter(isCategory) : []
  const resources = findResources({ city, categories: validCategories.length ? [...new Set(['urgence' as const, ...validCategories])] : undefined })
  const summary = JSON.stringify(
    resources.map(({ name, category, phone, description }) => ({ name, category, phone: phone ?? null, description })),
  )
  return { resources, summary, isError: false }
}

function mergeResources(existing: HelpResource[], incoming: HelpResource[]): HelpResource[] {
  const ids = new Set(existing.map((resource) => resource.id))
  return [...existing, ...incoming.filter((resource) => !ids.has(resource.id))]
}

async function* streamOffline(text: string): AsyncGenerator<ChatEvent> {
  // Découpage en morceaux pour garder le même rendu progressif que l'IA.
  for (const chunk of text.match(/[^\s]+\s*/g) ?? []) yield { type: 'text', delta: chunk }
}

/**
 * Point d'entrée unique de la conversation.
 * Ordre garanti : `risk` d'abord (calcul local, instantané), puis les urgences si besoin,
 * puis le texte, les fiches de lieux et enfin `done`.
 */
export async function* runChat(request: ChatRequest, config: EngineConfig, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
  const userTexts = request.messages.filter((message) => message.role === 'user').map((message) => message.content)
  const risk = assessConversation(userTexts)
  const city = (isCityId(request.city) ? request.city : null) ?? detectCity(userTexts.join(' '))
  yield { type: 'risk', risk }

  let sent: HelpResource[] = []
  if (risk.level === 'immediate' || risk.selfHarm) {
    sent = [...EMERGENCY_NUMBERS]
    yield { type: 'resources', resources: sent }
  }

  const fallback = async function* (): AsyncGenerator<ChatEvent> {
    const reply = offlineReply(userTexts, { city, risk })
    yield* streamOffline(reply.text)
    const merged = mergeResources(sent, reply.resources)
    if (merged.length > sent.length) yield { type: 'resources', resources: merged }
    yield { type: 'done', mode: 'offline' }
  }

  if (!config.client) {
    yield* fallback()
    return
  }

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...request.messages.map((message) => ({ role: message.role, content: message.content })),
    { role: 'system', content: contextNote(risk, city) },
  ]
  let streamedText = false

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const stream = config.client.beta.messages.stream(
        {
          model: config.model,
          max_tokens: 8000,
          system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          messages,
          tools: [FIND_RESOURCES_TOOL],
          output_config: { effort: config.effort },
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        },
        { signal },
      )

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          streamedText = true
          yield { type: 'text', delta: event.delta.text }
        }
      }
      const final = await stream.finalMessage()

      if (final.stop_reason === 'refusal') {
        // Toute la chaîne de modèles a refusé : on bascule sur les réponses sûres hors ligne.
        if (!streamedText) {
          yield* fallback()
          return
        }
        break
      }

      if (final.stop_reason !== 'tool_use') break

      const toolUses = final.content.filter((block): block is Anthropic.Beta.BetaToolUseBlock => block.type === 'tool_use')
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((block) => {
        if (block.name !== 'find_help_resources') {
          return { type: 'tool_result', tool_use_id: block.id, content: 'Outil inconnu.', is_error: true }
        }
        const result = runFindResources(block.input)
        sent = mergeResources(sent, result.resources)
        return { type: 'tool_result', tool_use_id: block.id, content: result.summary, is_error: result.isError }
      })
      if (sent.length) yield { type: 'resources', resources: sent }
      messages.push({ role: 'assistant', content: final.content }, { role: 'user', content: results })
      if (streamedText) yield { type: 'text', delta: '\n\n' }
    }

    // Filet de sécurité : danger élevé mais aucun lieu proposé par l'IA.
    if (isAtLeast(risk.level, 'high') && !sent.some((resource) => resource.city !== null)) {
      const extra = findResources({ city, categories: ['urgence', 'police', 'sante', 'accompagnement'] }).filter(
        (resource) => city || resource.city === null,
      )
      sent = mergeResources(sent, extra)
      yield { type: 'resources', resources: sent }
    }
    yield { type: 'done', mode: 'ai' }
  } catch (error) {
    if (signal?.aborted) {
      yield { type: 'error', message: 'Réponse arrêtée.', kind: 'interrupted' }
      return
    }
    // Aucune donnée de conversation dans les journaux : seulement le type d'erreur.
    console.error('[oriah-elle] AI request failed:', error instanceof Anthropic.APIError ? `${error.status} ${error.name}` : (error as Error)?.name)
    if (!streamedText) {
      yield* fallback()
      return
    }
    yield { type: 'error', message: 'La réponse a été interrompue. Les numéros d’urgence restent le 117 (Police) et le 113 (Gendarmerie).', kind: 'server' }
  }
}
