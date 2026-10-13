'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LogOut, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'
import { BRAND_NAME, DISCREET_NAME, useDiscreetMode } from './camouflage'
import { quickExit } from './quick-exit'

const NAV = [
  { href: '/chat', label: 'Parler', icon: MessageCircle },
  { href: '/aide', label: 'Trouver de l’aide', icon: MapPin },
  { href: '/securite', label: 'Ma sécurité', icon: ShieldCheck },
  { href: '/droits', label: 'Mes droits', icon: BookOpen },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [discreet] = useDiscreetMode()
  const lastEscape = useRef(0)

  // Deux appuis rapides sur Échap = sortie rapide, même sans viser le bouton.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      const now = Date.now()
      if (now - lastEscape.current < 600) quickExit()
      lastEscape.current = now
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-[var(--header-h)] shrink-0 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-5xl items-center gap-2 px-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground">
            {discreet ? 'N' : 'E'}
          </span>
          <span className="hidden sm:inline">{discreet ? DISCREET_NAME : BRAND_NAME}</span>
        </Link>
        <nav aria-label="Navigation principale" className="flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors hover:bg-muted',
                  active ? 'bg-secondary font-medium text-secondary-foreground' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={quickExit}
          title="Quitter immédiatement ce site (ou appuyez deux fois sur Échap)"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-sm font-semibold text-danger-foreground shadow-sm transition-transform active:scale-95"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Quitter
        </button>
      </div>
    </header>
  )
}
