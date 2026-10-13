import type { Metadata } from 'next'

import { SafetyView } from './safety-view'

export const metadata: Metadata = { title: 'Ma sécurité' }

export default function SecuritePage() {
  return <SafetyView />
}
