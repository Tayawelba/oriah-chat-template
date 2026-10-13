'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, Square, Trash2 } from 'lucide-react'

import { EmergencyCard } from '@/components/elle/emergency-card'
import { ResourceCard } from '@/components/elle/resource-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { httpAdapter } from '@/lib/chat/adapter'
import type { ChatMessage } from '@/lib/chat/types'
import { CITIES, isCityId, type CityId } from '@/lib/elle/resources'
import { maxLevel, type RiskLevel } from '@/lib/elle/risk'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  { label: 'Mon conjoint me frappe', prompt: 'Mon conjoint me frappe. Je ne sais pas quoi faire.' },
  { label: 'J’ai peur de rentrer chez moi', prompt: 'J’ai peur de rentrer chez moi ce soir.' },
  { label: 'Comment porter plainte ?', prompt: 'Comment porter plainte pour des violences ?' },
  { label: 'Préparer mon départ', prompt: 'Je veux partir. Comment préparer mon départ en sécurité ?' },
  { label: 'J’aide une amie', prompt: 'Une amie subit des violences. Comment puis-je l’aider ?' },
]

const MAX_MESSAGE_CHARACTERS = 1500
const RESOURCES_SHOWN = 4
const adapter = httpAdapter()

function AssistantResources({ message, city }: { message: ChatMessage; city: CityId | null }) {
  const local = (message.resources ?? []).filter((resource) => resource.city !== null)
  if (!local.length) return null
  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {local.slice(0, RESOURCES_SHOWN).map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
      {local.length > RESOURCES_SHOWN ? (
        <Link href={city ? `/aide?ville=${city}` : '/aide'} className="inline-block text-sm font-medium text-primary underline underline-offset-4">
          Voir les {local.length} lieux d’aide
        </Link>
      ) : null}
    </div>
  )
}

/**
 * La conversation ne vit que dans la mémoire de la page : aucun localStorage, aucun cookie.
 * Fermer l'onglet, recharger ou cliquer sur « Quitter » l'efface.
 */
export function ChatExperience() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [city, setCity] = useState<CityId | null>(null)
  const [risk, setRisk] = useState<RiskLevel>('none')
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isBusy])

  useEffect(() => () => abortRef.current?.abort(), [])

  const showEmergency = risk === 'immediate' || risk === 'high'
  const lastAssistantId = useMemo(() => messages.findLast((message) => message.role === 'assistant')?.id, [messages])

  async function submitMessage(text: string) {
    const normalized = text.replace(/[ \t]+/g, ' ').trim()
    if (!normalized || isBusy) return
    setError(null)
    setInput('')
    setIsBusy(true)
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: normalized, createdAt: Date.now() }
    const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', createdAt: Date.now() }
    const history = [...messages, userMessage]
    setMessages([...history, assistantMessage])
    const controller = new AbortController()
    abortRef.current = controller

    const update = (patch: (message: ChatMessage) => ChatMessage) =>
      setMessages((current) => current.map((message) => (message.id === assistantMessage.id ? patch(message) : message)))

    try {
      for await (const event of adapter.sendMessage({
        messages: history.filter((message) => message.content).map(({ role, content }) => ({ role, content })),
        city,
        signal: controller.signal,
      })) {
        if (event.type === 'risk') setRisk((current) => maxLevel(current, event.risk.level))
        if (event.type === 'text') update((message) => ({ ...message, content: message.content + event.delta }))
        if (event.type === 'resources') update((message) => ({ ...message, resources: event.resources }))
        if (event.type === 'error' && event.kind !== 'interrupted') setError(event.message)
        if (event.type === 'done') setOffline(event.mode === 'offline')
      }
    } finally {
      setIsBusy(false)
      abortRef.current = null
      // Une réponse vide (erreur avant le premier mot) ne doit pas rester affichée.
      setMessages((current) => current.filter((message) => message.id !== assistantMessage.id || message.content || message.resources?.length))
    }
  }

  function clearConversation() {
    abortRef.current?.abort()
    setMessages([])
    setInput('')
    setError(null)
    setRisk('none')
    setIsBusy(false)
  }

  return (
    <main data-fullscreen className="flex h-[calc(100svh-var(--header-h))] flex-col overflow-hidden">
      {showEmergency ? (
        <div className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-3 sm:px-6">
          <EmergencyCard compact />
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Je suis Elle. Je vous écoute.</h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Écrivez avec vos mots, en français, en anglais ou en pidgin. Rien n’est enregistré sur votre téléphone et je ne vous
              demanderai jamais votre nom.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button key={suggestion.label} type="button" variant="outline" size="sm" className="rounded-full" onClick={() => void submitMessage(suggestion.prompt)} disabled={isBusy}>
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-live="polite" aria-busy={isBusy}>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
            {messages.map((message) => {
              const isUser = message.role === 'user'
              if (!message.content && !message.resources?.length) return null
              return (
                <article key={message.id} className={cn('flex w-full text-[15px]', isUser && 'justify-end')}>
                  <div className={cn('min-w-0 leading-7', isUser ? 'max-w-[85%] whitespace-pre-wrap rounded-3xl bg-secondary px-4 py-2.5 text-secondary-foreground' : 'w-full')}>
                    {isUser ? null : <p className="mb-1 text-xs font-semibold text-primary">Elle</p>}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {!isUser && message.id === lastAssistantId ? <AssistantResources message={message} city={city} /> : null}
                  </div>
                </article>
              )
            })}
            {isBusy && !messages.at(-1)?.content ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4" aria-hidden="true" />
                Elle écrit…
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-2xl shrink-0 flex-col gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Ma ville
            <select
              value={city ?? ''}
              onChange={(event) => setCity(isCityId(event.target.value) ? event.target.value : null)}
              className="rounded-full border bg-background px-3 py-1 text-sm text-foreground"
            >
              <option value="">Non précisée</option>
              {CITIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {messages.length ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearConversation} className="text-muted-foreground">
              <Trash2 aria-hidden="true" />
              Effacer
            </Button>
          ) : null}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submitMessage(input)
          }}
        >
          <InputGroup className="rounded-2xl bg-card shadow-sm">
            <InputGroupTextarea
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, MAX_MESSAGE_CHARACTERS))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  void submitMessage(input)
                }
              }}
              placeholder="Écrivez ici ce qui se passe…"
              aria-label="Votre message"
              className="min-h-16 p-3.5"
              maxLength={MAX_MESSAGE_CHARACTERS}
              autoComplete="off"
              autoCorrect="on"
            />
            <InputGroupAddon align="block-end">
              <span className="text-xs font-normal text-muted-foreground">
                {input.length > MAX_MESSAGE_CHARACTERS - 200 ? `${MAX_MESSAGE_CHARACTERS - input.length} caractères restants` : ''}
              </span>
              {isBusy ? (
                <InputGroupButton type="button" size="icon-sm" variant="outline" aria-label="Arrêter la réponse" className="ml-auto rounded-full" onClick={() => abortRef.current?.abort()}>
                  <Square aria-hidden="true" />
                </InputGroupButton>
              ) : (
                <InputGroupButton type="submit" size="icon-sm" variant="default" aria-label="Envoyer" className="ml-auto rounded-full" disabled={!input.trim()}>
                  <ArrowUp aria-hidden="true" />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>
        <p className="text-center text-[11px] leading-4 text-muted-foreground">
          Elle est une intelligence artificielle{offline ? ' (mode hors ligne)' : ''} : elle peut se tromper et ne remplace ni la police
          ni un médecin. Danger immédiat : <a className="font-semibold underline" href="tel:117">117</a> ou{' '}
          <a className="font-semibold underline" href="tel:113">113</a>.
        </p>
      </div>
    </main>
  )
}
