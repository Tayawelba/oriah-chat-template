import type { RiskAssessment } from '@/lib/elle/risk'
import type { HelpResource } from '@/lib/elle/resources'

export type Role = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: Role
  content: string
  createdAt: number
  resources?: HelpResource[]
}

/** Ce qui circule de l'API vers l'interface, une ligne JSON par événement. */
export type ChatEvent =
  | { type: 'risk'; risk: RiskAssessment }
  | { type: 'text'; delta: string }
  | { type: 'resources'; resources: HelpResource[] }
  | { type: 'error'; message: string; kind?: 'network' | 'server' | 'interrupted' | 'rate_limited' }
  | { type: 'done'; mode: 'ai' | 'offline' }

/** Ce que l'interface envoie à l'API. */
export type ChatRequest = {
  messages: Pick<ChatMessage, 'role' | 'content'>[]
  city?: string | null
}
