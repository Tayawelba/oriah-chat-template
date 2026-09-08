'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, BookOpen, CircleHelp, Home, Moon, PanelLeft, Plus, Square, Sun, Volume2, VolumeX, X } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { demoAdapter } from '@/lib/chat/adapter'
import type { ChatMessage, Source } from '@/lib/chat/types'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  { label: 'Choisir une voiture', prompt: 'Aide-moi à choisir une voiture adaptée à mon usage et à mon budget.' },
  { label: 'Comparer deux modèles', prompt: 'Quels critères faut-il regarder pour comparer sérieusement deux voitures ?' },
  { label: 'Vérifier une occasion', prompt: 'Donne-moi une checklist pour vérifier une voiture d’occasion avant l’achat.' },
  { label: 'Comprendre un voyant', prompt: 'Comment évaluer l’urgence d’un voyant moteur qui vient de s’allumer ?' },
]

const CHAT_SOUND_PREFERENCE_KEY = 'oriah-chat-sound-enabled'
const CHAT_THEME_PREFERENCE_KEY = 'oriah-chat-theme'
const MAX_MESSAGE_CHARACTERS = 1500

function playChatNotification() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime
  oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(660, start); oscillator.frequency.linearRampToValueAtTime(880, start + 0.12)
  gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2)
  oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start + 0.2)
  oscillator.addEventListener('ended', () => void context.close(), { once: true })
}

function getMessageText(message: ChatMessage) { return message.content.trim() }

function ConversationPanel({ conversations, onClose, onNew }: { conversations: ChatMessage[][]; onClose: () => void; onNew: () => void }) {
  return <aside className="absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r bg-background shadow-xl">
    <div className="flex items-center justify-between border-b px-4 py-3"><span className="text-sm font-medium">Conversations</span><Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fermer le volet"><X aria-hidden="true" /></Button></div>
    <div className="p-3"><Button className="w-full" onClick={onNew}><Plus aria-hidden="true" /> Nouvelle conversation</Button></div>
    <div className="flex-1 space-y-1 overflow-y-auto px-3">{conversations.map((conversation, index) => <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted" key={index} onClick={onClose}>{conversation.find((message) => message.role === 'user')?.content || 'Nouvelle conversation'}</button>)}</div>
  </aside>
}

export function ChatExperience() {
  const [input, setInput] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<ChatMessage[][]>([])
  const [showConversations, setShowConversations] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, isBusy])
  useEffect(() => { setSoundEnabled(window.localStorage.getItem(CHAT_SOUND_PREFERENCE_KEY) === 'true') }, [])
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(CHAT_THEME_PREFERENCE_KEY)
    const nextDarkMode = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(nextDarkMode)
    document.documentElement.classList.toggle('dark', nextDarkMode)
  }, [])

  async function submitMessage(text: string) {
    const normalized = text.replace(/\s+/g, ' ').trim()
    if (!normalized || isBusy) return
    setError(null); setInput(''); setIsBusy(true)
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: normalized, createdAt: Date.now() }
    const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', createdAt: Date.now() }
    setMessages((current) => [...current, userMessage, assistantMessage])
    const controller = new AbortController(); abortRef.current = controller
    try {
      for await (const event of demoAdapter.sendMessage({ messages: [...messages, userMessage], signal: controller.signal })) {
        if (event.type === 'text') setMessages((current) => current.map((message) => message.id === assistantMessage.id ? { ...message, content: message.content + event.delta } : message))
        if (event.type === 'sources') setMessages((current) => current.map((message) => message.id === assistantMessage.id ? { ...message, sources: event.sources } : message))
        if (event.type === 'error') setError(event.message)
      }
      if (soundEnabled) playChatNotification()
    } catch (caught) { if (!(caught instanceof DOMException && caught.name === 'AbortError')) setError('Le chat est temporairement indisponible. Réessayez dans un instant.') }
    finally { setIsBusy(false); abortRef.current = null }
  }

  function resetConversation() { abortRef.current?.abort(); if (messages.length) setConversations((current) => [...current, messages]); setMessages([]); setInput(''); setError(null); setIsBusy(false) }
  function toggleSound() { const nextValue = !soundEnabled; setSoundEnabled(nextValue); window.localStorage.setItem(CHAT_SOUND_PREFERENCE_KEY, String(nextValue)); if (nextValue) playChatNotification() }
  function toggleTheme() { const nextValue = !darkMode; setDarkMode(nextValue); window.localStorage.setItem(CHAT_THEME_PREFERENCE_KEY, nextValue ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', nextValue) }

  return <main className="relative flex h-svh flex-col overflow-hidden bg-background text-foreground">
    {showConversations ? <ConversationPanel conversations={conversations} onClose={() => setShowConversations(false)} onNew={resetConversation} /> : null}
    <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon-sm" aria-label="Ouvrir les conversations" onClick={() => setShowConversations(true)}><PanelLeft aria-hidden="true" /></Button><Link href="/" className="truncate text-sm font-medium">Oriah Auto AI</Link></div>
      <div className="flex items-center gap-1 sm:gap-2"><Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/"><Home aria-hidden="true" />Accueil</Link></Button><Button asChild variant="ghost" size="sm" className="hidden md:inline-flex"><Link href="/guides-achat"><BookOpen aria-hidden="true" />Guides</Link></Button><Button asChild variant="ghost" size="sm"><Link href="/faq" aria-label="Questions fréquentes"><CircleHelp aria-hidden="true" /><span className="hidden sm:inline">FAQ</span></Link></Button><Button type="button" variant="ghost" size="icon-sm" aria-label={darkMode ? 'Activer le thème clair' : 'Activer le thème sombre'} aria-pressed={darkMode} title={darkMode ? 'Thème clair' : 'Thème sombre'} onClick={toggleTheme}>{darkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button><Button type="button" variant="secondary" size="sm" aria-label="Démarrer un nouveau chat" onClick={resetConversation}><Plus aria-hidden="true" /><span className="hidden sm:inline">Nouveau chat</span></Button></div>
    </header>
    {messages.length === 0 ? <div className="flex min-h-0 flex-1 items-center justify-center p-6"><Empty className="gap-4 rounded-3xl p-0"><EmptyHeader><EmptyTitle>Comment puis-je vous aider ?</EmptyTitle><EmptyDescription>Posez une question sur l’achat, l’entretien ou la comparaison d’un véhicule.</EmptyDescription></EmptyHeader><EmptyContent><div className="flex flex-wrap justify-center gap-2">{SUGGESTIONS.map((suggestion) => <Button key={suggestion.label} type="button" variant="outline" size="sm" onClick={() => void submitMessage(suggestion.prompt)} disabled={isBusy}>{suggestion.label}</Button>)}</div></EmptyContent></Empty></div> : <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-live="polite"><div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">{messages.map((message) => { const text = getMessageText(message); const isUser = message.role === 'user'; const sources = (message.sources || []) as Source[]; if (!text && !sources.length) return null; return <article key={message.id} className={cn('flex w-full text-sm', isUser && 'justify-end')}><div className={cn('min-w-0 whitespace-pre-wrap leading-7', isUser ? 'max-w-[80%] rounded-3xl bg-muted px-4 py-2.5' : 'w-full')}>{text}{sources.length ? <div className="mt-4 flex flex-wrap gap-2 border-t pt-3 text-xs text-muted-foreground">{sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="rounded-full border px-2.5 py-1 transition-colors hover:bg-muted hover:text-foreground">{source.title}</a>)}</div> : null}</div></article> })}{isBusy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner className="size-4" aria-hidden="true" />Réflexion en cours…</div>}</div></div>}
    <div className="mx-auto flex w-full max-w-2xl shrink-0 flex-col gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">{error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}<form onSubmit={(event) => { event.preventDefault(); void submitMessage(input) }}><InputGroup className="rounded-2xl border-transparent bg-input/50 shadow-none"><InputGroupTextarea value={input} onChange={(event) => setInput(event.target.value.slice(0, MAX_MESSAGE_CHARACTERS))} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submitMessage(input) } }} placeholder="Envoyez un message…" aria-label="Votre question automobile" className="min-h-20 p-3.5" maxLength={MAX_MESSAGE_CHARACTERS} disabled={isBusy} /><InputGroupAddon align="block-end"><span className="text-xs font-normal text-muted-foreground">{MAX_MESSAGE_CHARACTERS - input.length} caractères</span>{isBusy ? <InputGroupButton type="button" size="icon-sm" variant="outline" aria-label="Arrêter la génération" className="ml-auto rounded-full" onClick={() => abortRef.current?.abort()}><Square aria-hidden="true" /></InputGroupButton> : <InputGroupButton type="submit" size="icon-sm" variant="default" aria-label="Envoyer le message" className="ml-auto rounded-full" disabled={!input.trim()}><ArrowUp aria-hidden="true" /></InputGroupButton>}</InputGroupAddon></InputGroup></form><div className="flex min-h-8 items-center gap-2"><p className="flex-1 text-center text-[11px] leading-4 text-muted-foreground">Oriah Auto AI peut faire des erreurs. Vérifiez les informations importantes.</p><Button type="button" variant="ghost" size="icon-sm" aria-label={soundEnabled ? 'Désactiver le son du chat' : 'Activer le son du chat'} aria-pressed={soundEnabled} title={soundEnabled ? 'Son activé' : 'Son désactivé'} className="shrink-0 rounded-full text-muted-foreground" onClick={toggleSound}>{soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</Button></div></div>
  </main>
}
