import type { ChatEvent, ChatMessage } from './types'

export interface ChatAdapter {
  sendMessage(input: { messages: ChatMessage[]; signal: AbortSignal }): AsyncGenerator<ChatEvent>
}

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, ms)
  signal.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')) }, { once: true })
})

const demoText = 'Voici une réponse de démonstration. Remplacez le demoAdapter par votre propre adaptateur pour connecter votre modèle, votre recherche web ou votre base documentaire.'

export const demoAdapter: ChatAdapter = {
  async *sendMessage({ signal }) {
    try {
      for (const word of demoText.split(' ')) { await wait(28, signal); yield { type: 'text', delta: `${word} ` } }
      yield { type: 'link', link: { url: 'https://example.com/guide', title: 'Guide de démonstration', description: 'Un aperçu de lien indépendant du fournisseur.', domain: 'example.com' } }
      yield { type: 'sources', sources: [{ id: 'demo-1', title: 'Documentation du template', domain: 'github.com', url: 'https://github.com/' }] }
      yield { type: 'done' }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') { yield { type: 'error', message: 'Génération arrêtée.', kind: 'interrupted' }; return }
      yield { type: 'error', message: 'La connexion a été interrompue.', kind: 'network' }
    }
  },
}

export function httpAdapter(endpoint: string): ChatAdapter {
  return { async *sendMessage({ messages, signal }) {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages }), signal })
    if (!response.ok) throw new Error(`Chat request failed: ${response.status}`)
    const payload = await response.json() as { message?: ChatMessage }
    if (!payload.message?.content) throw new Error('Invalid chat response')
    yield { type: 'text', delta: payload.message.content }
    yield { type: 'done' }
  } }
}
