import type { Metadata } from 'next'
import Link from 'next/link'

import { PageShell } from '@/components/elle/page-shell'

export const metadata: Metadata = { title: 'Mes droits' }

export default function DroitsPage() {
  return (
    <PageShell
      eyebrow="Mes droits"
      title="Ce que dit la loi, et comment la faire respecter"
      intro="Ces informations sont générales. Pour votre situation précise, une association, la délégation du MINPROFF ou un avocat peuvent vous conseiller."
    >
      <div className="prose-elle">
        <h2>La violence est interdite, même dans le couple</h2>
        <p>
          Le Code pénal camerounais (loi n° 2016/007 du 12 juillet 2016) punit les atteintes à l’intégrité physique, quel que soit
          le lien entre la victime et l’auteur. Être mariée, fiancée ou dépendre financièrement de quelqu’un ne lui donne aucun
          droit de vous frapper, de vous menacer ou de vous forcer.
        </p>
        <ul>
          <li>Coups et blessures (articles 277 à 281).</li>
          <li>Viol (article 296), y compris quand l’auteur est un proche.</li>
          <li>Harcèlement sexuel (article 302-1).</li>
          <li>Mariage forcé (article 356).</li>
          <li>Menaces (articles 301 et suivants).</li>
        </ul>

        <h2>Porter plainte</h2>
        <ul>
          <li>Au commissariat de police ou à la brigade de gendarmerie la plus proche.</li>
          <li>Ou par écrit, directement auprès du Procureur de la République, au tribunal de première instance.</li>
          <li>Apportez ce que vous avez : certificat médical, photos, messages, noms de témoins. Même sans preuve, votre parole compte.</li>
          <li>Vous pouvez venir accompagnée. Demandez un récépissé ou une copie de votre plainte.</li>
          <li>Si on refuse de prendre votre plainte, écrivez au Procureur et contactez une association.</li>
        </ul>

        <h2>Le certificat médical</h2>
        <ul>
          <li>Allez dans un hôpital ou un centre de santé et dites que vous avez été frappée ou agressée.</li>
          <li>Le médecin décrit vos blessures et fixe une durée d’incapacité : c’est une preuve importante, même si vous portez plainte plus tard.</li>
          <li>Après un viol, consultez dans les 72 heures : contraception d’urgence et traitement pour prévenir le VIH.</li>
        </ul>

        <h2>Les enfants</h2>
        <ul>
          <li>Les enfants exposés aux violences en sont aussi victimes.</li>
          <li>Les violences sur mineurs et le mariage d’enfants sont punis plus sévèrement.</li>
          <li>Les questions de garde et de pension relèvent du juge : une association peut vous aider à préparer votre dossier.</li>
        </ul>

        <h2>Être accompagnée</h2>
        <p>
          Les délégations du Ministère de la Promotion de la Femme et de la Famille (MINPROFF), les Centres de Promotion de la Femme
          et de la Famille et les associations de défense des droits des femmes peuvent vous écouter, vous orienter et vous aider
          dans vos démarches. Si vous n’avez pas les moyens de payer un avocat, renseignez-vous sur l’assistance judiciaire auprès du
          tribunal.
        </p>
        <p>
          <Link href="/aide" className="font-medium text-primary underline underline-offset-4">
            Voir les lieux d’aide dans ma ville
          </Link>
        </p>
      </div>
    </PageShell>
  )
}
