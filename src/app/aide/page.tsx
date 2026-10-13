import type { Metadata } from 'next'
import { Suspense } from 'react'

import { DirectoryView } from './directory-view'

export const metadata: Metadata = { title: 'Trouver de l’aide' }

export default function AidePage() {
  return (
    <Suspense>
      <DirectoryView />
    </Suspense>
  )
}
