import type { ChatEvent, ChatRequest } from './types'

export interface ChatAdapter {
  sendMessage(input: ChatRequest & { signal: AbortSignal }): AsyncGenerator<ChatEvent>
}

/** Lit la réponse NDJSON de /api/chat, un événement par ligne. */
export function httpAdapter(endpoint = '/api/chat'): ChatAdapter {
  return {
    async *sendMessage({ messages, city, signal }) {
      let response: Response
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages, city }),
          signal,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          yield { type: 'error', message: 'Réponse arrêtée.', kind: 'interrupted' }
          return
        }
        yield { type: 'error', message: 'Pas de connexion internet. En cas d’urgence, appelez le 117 ou le 113 : ces appels ne demandent pas internet.', kind: 'network' }
        return
      }

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        yield {
          type: 'error',
          message: payload?.error ?? 'Le service est momentanément indisponible. En cas d’urgence : 117 ou 113.',
          kind: response.status === 429 ? 'rate_limited' : 'server',
        }
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let newline = buffer.indexOf('\n')
          while (newline !== -1) {
            const raw = buffer.slice(0, newline).trim()
            buffer = buffer.slice(newline + 1)
            if (raw) yield JSON.parse(raw) as ChatEvent
            newline = buffer.indexOf('\n')
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          yield { type: 'error', message: 'Réponse arrêtée.', kind: 'interrupted' }
          return
        }
        yield { type: 'error', message: 'La connexion a été interrompue. En cas d’urgence : 117 ou 113.', kind: 'network' }
      }
    },
  }
}
