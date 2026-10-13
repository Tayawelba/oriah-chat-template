'use client'

import { useState } from 'react'
import Link from 'next/link'

import { EmergencyCard } from '@/components/elle/emergency-card'
import { PageShell } from '@/components/elle/page-shell'
import { DANGER_ADVICE, DANGER_QUESTIONS, scoreDanger } from '@/lib/elle/assessment'
import { cn } from '@/lib/utils'

const SAFETY_PLAN = [
  'J’ai noté les numéros d’urgence : 117 (Police), 113 (Gendarmerie), 118 (Pompiers).',
  'J’ai choisi une personne de confiance et un mot code : si je l’envoie, elle appelle à l’aide.',
  'Je sais où aller en urgence : famille, amie, voisine, lieu public ouvert.',
  'J’ai préparé un sac (ou je l’ai confié à une proche) : CNI, actes de naissance des enfants, carnet de santé, argent, médicaments, chargeur, clés.',
  'J’ai fait des copies de mes papiers importants et je les ai mises à l’abri.',
  'Je garde les preuves en lieu sûr : photos des blessures, certificats médicaux, messages de menace.',
  'Je sais quelle pièce éviter pendant une dispute : cuisine, pièce sans issue, pièce avec des objets dangereux.',
  'J’ai appris à mes enfants à appeler à l’aide et où se mettre à l’abri.',
  'J’efface l’historique de navigation après avoir consulté ce site, ou j’utilise la navigation privée.',
]

export function SafetyView() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [showResult, setShowResult] = useState(false)
  const [plan, setPlan] = useState<Record<number, boolean>>({})
  const answered = DANGER_QUESTIONS.filter((question) => question.id in answers).length
  const result = scoreDanger(answers)
  const advice = DANGER_ADVICE[result.level]
  const urgent = result.level === 'high' || result.level === 'severe'

  return (
    <PageShell
      eyebrow="Ma sécurité"
      title="Évaluer le danger et préparer un plan"
      intro="Vos réponses restent sur cet écran : rien n’est envoyé ni enregistré. Elles disparaissent quand vous quittez la page."
    >
      <section aria-labelledby="test-title">
        <h2 id="test-title" className="text-lg font-semibold">
          1. Suis-je en danger ?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Pensez à la personne qui vous fait du mal (conjoint, ex, fiancé, parent…).</p>
        <ol className="mt-4 space-y-3">
          {DANGER_QUESTIONS.map((question, index) => (
            <li key={question.id} className="rounded-2xl border bg-card p-4">
              <p className="font-medium leading-6">
                {index + 1}. {question.text}
              </p>
              <div className="mt-3 flex gap-2" role="radiogroup" aria-label={question.text}>
                {[
                  { value: true, label: 'Oui' },
                  { value: false, label: 'Non' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={answers[question.id] === option.value}
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))}
                    className={cn(
                      'min-w-20 rounded-full border px-4 py-1.5 text-sm font-medium',
                      answers[question.id] === option.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResult(true)}
            disabled={answered === 0}
            className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
          >
            Voir le résultat
          </button>
          <span className="text-sm text-muted-foreground">
            {answered}/{DANGER_QUESTIONS.length} réponses
          </span>
        </div>

        {showResult ? (
          <div role="status" className={cn('mt-6 rounded-2xl border p-5', urgent ? 'border-danger/50 bg-danger-soft' : 'bg-muted')}>
            <p className="text-lg font-semibold">{advice.title}</p>
            <p className="mt-2 leading-7">{advice.text}</p>
            {urgent ? <EmergencyCard compact className="mt-4" /> : null}
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
              <Link href="/aide" className="text-primary underline underline-offset-4">
                Trouver une structure d’aide
              </Link>
              <Link href="/chat" className="text-primary underline underline-offset-4">
                En parler avec Elle
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Ce test s’inspire des facteurs de risque reconnus par la recherche. Il ne remplace pas l’avis d’une professionnelle.
            </p>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="plan-title" className="mt-12">
        <h2 id="plan-title" className="text-lg font-semibold">
          2. Mon plan de sécurité
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Cochez ce qui est prêt. Avancez à votre rythme, sans prendre de risque.</p>
        <ul className="mt-4 space-y-2">
          {SAFETY_PLAN.map((item, index) => (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-muted">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                  checked={Boolean(plan[index])}
                  onChange={(event) => setPlan((current) => ({ ...current, [index]: event.target.checked }))}
                />
                <span className="leading-6">{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  )
}
