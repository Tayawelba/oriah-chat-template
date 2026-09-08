import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return <main className="page-shell"><header className="topbar"><Link className="brand" href="/chat"><span className="brand-mark">O</span> Oriah Chat</Link></header><section className="narrow-page"><Link className="back-link" href="/chat"><ArrowLeft size={15} /> Retour au chat</Link><p className="eyebrow">Confidentialité</p><h1>Vos conversations</h1><p className="lede">Cette démo garde les messages uniquement dans la mémoire du navigateur pendant la session.</p><div className="prose-card"><h2>À adapter avant production</h2><p>Ajoutez votre politique de conservation, vos contrôles d’accès et votre stratégie de suppression. Le template ne transmet aucune donnée à un fournisseur externe par défaut : l’adaptateur mock est local.</p><h2>Bonnes pratiques</h2><p>Ne demandez pas de secrets dans le chat, limitez la taille des entrées, journalisez le minimum et affichez clairement les erreurs réseau.</p></div></section></main>
}
