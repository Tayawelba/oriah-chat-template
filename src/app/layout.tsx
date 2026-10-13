import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Geist } from 'next/font/google'

import { SiteHeader } from '@/components/elle/site-header'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Oriah Elle', template: '%s · Oriah Elle' },
  description: 'Écoute, information et orientation gratuites et confidentielles pour les femmes et les filles victimes de violences au Cameroun.',
  // Le site ne doit pas apparaître dans les moteurs de recherche avec le contenu des pages d'aide.
  robots: { index: true, follow: true },
  referrer: 'no-referrer',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9ff' },
    { media: '(prefers-color-scheme: dark)', color: '#120d1f' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geist.variable} font-sans antialiased`}>
      <body className="flex min-h-svh flex-col">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2">
          Aller au contenu
        </a>
        <SiteHeader />
        <div id="contenu" className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
        <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground [body:has(main[data-fullscreen])_&]:hidden">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/faq">Questions fréquentes</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <span>Un service d’Oriah Technologies</span>
          </nav>
        </footer>
      </body>
    </html>
  )
}
