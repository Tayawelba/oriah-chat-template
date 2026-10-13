import { Phone } from 'lucide-react'

import { EMERGENCY_NUMBERS } from '@/lib/elle/resources'
import { cn } from '@/lib/utils'

/** Numéros d'urgence cliquables. Toujours visibles quand le danger est immédiat. */
export function EmergencyCard({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <section
      aria-label="Numéros d’urgence"
      className={cn('rounded-2xl border border-danger/40 bg-danger-soft p-4', compact && 'p-3', className)}
    >
      <p className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
        En danger maintenant ? Appelez — c’est gratuit, même sans crédit ni internet.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {EMERGENCY_NUMBERS.map((resource) => (
          <a
            key={resource.id}
            href={`tel:${resource.phone}`}
            className="flex flex-col items-center rounded-xl bg-danger px-2 py-2 text-center text-danger-foreground shadow-sm transition-transform active:scale-95"
          >
            <span className="flex items-center gap-1 text-lg font-bold">
              <Phone className="size-4" aria-hidden="true" />
              {resource.phone}
            </span>
            <span className="text-xs leading-4">{resource.name}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
