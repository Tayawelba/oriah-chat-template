export type Role = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: Role
  content: string
  createdAt: number
  sources?: Source[]
  links?: LinkPreview[]
}

export type Source = { id: string; title: string; domain: string; url: string }
export type LinkPreview = { url: string; title: string; description: string; domain: string; image?: string }

export type ChatEvent =
  | { type: 'text'; delta: string }
  | { type: 'sources'; sources: Source[] }
  | { type: 'link'; link: LinkPreview }
  | { type: 'error'; message: string; kind?: 'network' | 'server' | 'interrupted' }
  | { type: 'done' }
