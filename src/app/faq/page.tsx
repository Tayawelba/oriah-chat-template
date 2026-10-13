import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'

import { DiscreetToggle } from '@/components/elle/camouflage'
import { PageShell } from '@/components/elle/page-shell'

export const metadata: Metadata = { title: 'Questions fréquentes' }

const ITEMS: [string, string][] = [
  ['Qui est Elle ?', 'Elle est une assistante d’intelligence artificielle conçue par Oriah Technologies pour écouter, informer et orienter les femmes et les filles victimes de violences au Cameroun. Elle n’est ni la police, ni un médecin, ni une avocate : elle vous aide à trouver ces personnes.'],
  ['Est-ce gratuit ?', 'Oui, toujours, pour toutes les femmes, les filles et leurs proches.'],
  ['Mes messages sont-ils enregistrés ?', 'Non. La conversation reste dans la page ouverte sur votre téléphone et disparaît quand vous la fermez. Nous ne demandons ni nom, ni numéro, ni compte. Pour répondre, vos messages sont transmis de façon chiffrée au service d’intelligence artificielle, sans information qui vous identifie.'],
  ['À quoi sert le bouton « Quitter » ?', 'Il ferme immédiatement le site et affiche une page Google ordinaire. Le bouton « retour » ne ramène pas à la conversation. Sur ordinateur, appuyer deux fois sur Échap fait la même chose.'],
  ['Et si quelqu’un regarde mon téléphone ?', 'Utilisez la navigation privée, effacez l’historique après votre visite et activez le mode discret ci-dessous : le site s’affichera comme « Mes notes ».'],
  ['Elle peut-elle appeler la police pour moi ?', 'Non. En cas de danger, appelez le 117 (Police) ou le 113 (Gendarmerie) : ces appels sont gratuits. Elle peut vous aider à préparer ce que vous allez dire.'],
  ['J’aide une amie, une sœur, une voisine. Puis-je utiliser Elle ?', 'Oui. Elle peut vous conseiller sur la façon d’aider sans mettre la personne en danger.'],
  ['Dans quelles villes trouvez-vous des lieux d’aide ?', 'Yaoundé, Douala, Buea, Bamenda, Maroua et Garoua pour commencer. Les numéros d’urgence fonctionnent partout au Cameroun.'],
]

export default function FaqPage() {
  return (
    <PageShell eyebrow="Aide" title="Questions fréquentes">
      <div className="space-y-3">
        {ITEMS.map(([question, answer]) => (
          <details key={question} className="group rounded-2xl border bg-card p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {question}
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-muted p-4">
        <DiscreetToggle />
      </div>
    </PageShell>
  )
}
