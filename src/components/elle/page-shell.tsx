import type { ReactNode } from 'react'

export function PageShell({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {intro ? <div className="mt-3 text-base leading-7 text-muted-foreground">{intro}</div> : null}
      <div className="mt-8">{children}</div>
    </main>
  )
}
