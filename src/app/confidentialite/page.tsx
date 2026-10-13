import type { Metadata } from 'next'

import { PageShell } from '@/components/elle/page-shell'

export const metadata: Metadata = { title: 'Confidentialité' }

export default function ConfidentialitePage() {
  return (
    <PageShell eyebrow="Confidentialité" title="Votre sécurité passe avant tout" intro="Oriah Elle est conçue pour collecter le moins de données possible.">
      <div className="prose-elle">
        <h2>Ce que nous ne collectons pas</h2>
        <ul>
          <li>Aucun compte, aucun nom, aucun numéro de téléphone.</li>
          <li>Aucun cookie de suivi ni outil publicitaire.</li>
          <li>Aucun historique de conversation enregistré sur votre appareil ni sur nos serveurs.</li>
        </ul>
        <h2>Ce qui circule</h2>
        <ul>
          <li>Pour répondre, vos messages sont envoyés de façon chiffrée (HTTPS) à notre serveur, puis au fournisseur d’intelligence artificielle (Anthropic). Ils ne sont pas conservés par Oriah Elle.</li>
          <li>Notre serveur garde temporairement, en mémoire, l’adresse IP de connexion pour limiter les abus (20 messages par minute). Elle n’est pas associée au contenu des messages.</li>
          <li>Les journaux techniques ne contiennent jamais le texte des conversations.</li>
        </ul>
        <h2>Sur votre appareil</h2>
        <ul>
          <li>Seule la préférence « mode discret » est mémorisée dans votre navigateur, si vous l’activez.</li>
          <li>L’historique de navigation reste visible pour toute personne qui utilise votre téléphone : utilisez la navigation privée ou effacez-le.</li>
        </ul>
        <h2>Statistiques</h2>
        <p>
          Oriah Elle n’enregistre aucune conversation. Si des statistiques sont un jour partagées avec des partenaires (nombre de conversations, villes, types de violences), elles seront
          uniquement agrégées et anonymes, et ne permettront jamais d’identifier une personne.
        </p>
      </div>
    </PageShell>
  )
}
