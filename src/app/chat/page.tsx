import type { Metadata } from 'next'

import { ChatExperience } from '@/components/chat/ChatExperience'

export const metadata: Metadata = { title: 'Parler' }

export default function ChatPage() {
  return <ChatExperience />
}
