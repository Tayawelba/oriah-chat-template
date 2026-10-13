import { MapPin, Phone } from 'lucide-react'

import { CATEGORY_LABELS, mapUrl, type HelpResource } from '@/lib/elle/resources'

export function ResourceCard({ resource }: { resource: HelpResource }) {
  const map = mapUrl(resource)
  return (
    <article className="rounded-2xl border bg-card p-4 text-card-foreground">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">{CATEGORY_LABELS[resource.category]}</p>
      <h3 className="mt-1 font-semibold leading-6">{resource.name}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{resource.description}</p>
      {resource.address ? <p className="mt-1 text-sm">{resource.address}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {resource.phone ? (
          <a href={`tel:${resource.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            <Phone className="size-4" aria-hidden="true" />
            Appeler le {resource.phone}
          </a>
        ) : null}
        {map ? (
          <a href={map} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            <MapPin className="size-4" aria-hidden="true" />
            Itinéraire
          </a>
        ) : null}
      </div>
    </article>
  )
}
