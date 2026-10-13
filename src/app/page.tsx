import Link from 'next/link'
import { ArrowRight, BookOpen, EyeOff, Lock, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'

import { DiscreetToggle } from '@/components/elle/camouflage'
import { EmergencyCard } from '@/components/elle/emergency-card'

const ACTIONS = [
  { href: '/chat', icon: MessageCircle, title: 'Parler à Elle', text: 'Racontez ce qui se passe. Elle vous écoute, vous informe et vous oriente, jour et nuit.' },
  { href: '/aide', icon: MapPin, title: 'Trouver de l’aide près de moi', text: 'Hôpitaux, police, centres pour femmes et aide juridique à Yaoundé, Douala, Buea, Bamenda, Maroua et Garoua.' },
  { href: '/securite', icon: ShieldCheck, title: 'Évaluer mon danger', text: '12 questions pour mesurer le risque et préparer un plan de sécurité.' },
  { href: '/droits', icon: BookOpen, title: 'Connaître mes droits', text: 'Ce que dit la loi, comment porter plainte, comment obtenir un certificat médical.' },
]

const PROMISES = [
  { icon: Lock, title: 'Confidentiel', text: 'Pas de compte, pas de nom demandé. La conversation disparaît quand vous fermez la page.' },
  { icon: EyeOff, title: 'Discret', text: 'Le bouton « Quitter » ferme le site en un geste. Le mode discret change le nom affiché.' },
  { icon: ShieldCheck, title: 'Gratuit', text: 'Pour toutes les femmes et les filles, et pour leurs proches qui veulent les aider.' },
]

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      <section className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Oriah Elle</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">Vous n’êtes pas seule.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Si quelqu’un vous frappe, vous menace, vous force ou vous contrôle, ce n’est pas de votre faute. Elle vous écoute sans
          vous juger et vous aide à trouver une aide réelle près de chez vous.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/chat" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm">
            Commencer à parler <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/aide" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold hover:bg-muted">
            Voir les lieux d’aide
          </Link>
        </div>
      </section>

      <EmergencyCard className="mt-10 max-w-2xl" />

      <section aria-label="Ce que vous pouvez faire" className="mt-12 grid gap-4 sm:grid-cols-2">
        {ACTIONS.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50">
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
          </Link>
        ))}
      </section>

      <section aria-label="Nos engagements" className="mt-12 grid gap-6 sm:grid-cols-3">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <h2 className="mt-2 font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-2xl bg-muted p-5">
        <h2 className="font-semibold">Votre téléphone est surveillé ?</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Utilisez la navigation privée, effacez l’historique après votre visite, et activez le mode discret.
        </p>
        <div className="mt-3">
          <DiscreetToggle />
        </div>
      </section>
    </main>
  )
}
