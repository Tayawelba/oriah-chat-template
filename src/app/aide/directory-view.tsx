'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { EmergencyCard } from '@/components/elle/emergency-card'
import { PageShell } from '@/components/elle/page-shell'
import { ResourceCard } from '@/components/elle/resource-card'
import { CATEGORY_LABELS, CITIES, findResources, isCityId, type ResourceCategory } from '@/lib/elle/resources'
import { cn } from '@/lib/utils'

const FILTERS = (Object.keys(CATEGORY_LABELS) as ResourceCategory[]).filter((category) => category !== 'urgence')

export function DirectoryView() {
  const params = useSearchParams()
  const router = useRouter()
  const initial = params.get('ville')
  const [city, setCity] = useState(isCityId(initial) ? initial : 'yaounde')
  const [category, setCategory] = useState<ResourceCategory | null>(null)

  const resources = findResources({ city, categories: category ? [category] : undefined }).filter((resource) => resource.city !== null)

  return (
    <PageShell
      eyebrow="Annuaire"
      title="Trouver de l’aide près de chez moi"
      intro="Choisissez votre ville. Appelez avant de vous déplacer si vous le pouvez. Vous pouvez venir accompagnée d’une personne de confiance."
    >
      <EmergencyCard />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          Ville
          <select
            value={city}
            onChange={(event) => {
              const next = event.target.value
              if (!isCityId(next)) return
              setCity(next)
              router.replace(`/aide?ville=${next}`, { scroll: false })
            }}
            className="rounded-full border bg-background px-3 py-1.5"
          >
            {CITIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} ({option.region})
              </option>
            ))}
          </select>
        </label>
        <div role="group" aria-label="Type d’aide" className="flex flex-wrap gap-2">
          {[null, ...FILTERS].map((option) => (
            <button
              key={option ?? 'all'}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
              className={cn('rounded-full border px-3 py-1 text-sm', category === option ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              {option ? CATEGORY_LABELS[option] : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
        {resources.length === 0 ? <p className="text-muted-foreground">Aucun lieu de ce type pour cette ville pour le moment.</p> : null}
      </div>

      <p className="mt-8 text-xs leading-5 text-muted-foreground">
        Annuaire en cours de vérification avec nos partenaires. Les itinéraires ouvrent Google Maps ; vérifiez les horaires sur place.
      </p>
    </PageShell>
  )
}
