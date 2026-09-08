import Link from 'next/link'
import { ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react'

const items = [
  ['Comment brancher mon backend ?', 'Implémentez ChatAdapter dans src/lib/chat/adapter.ts. Le composant ne dépend ensuite ni d’un fournisseur IA ni d’un format réseau précis.'],
  ['Que se passe-t-il si la connexion est interrompue ?', 'L’interface conserve les messages, affiche une alerte non bloquante et propose de réessayer. Le bouton d’arrêt annule aussi la requête en cours.'],
  ['Les liens sont-ils prévisualisés ?', 'Oui. Un événement link affiche une carte avec titre, domaine, description et favicon. Si votre backend ne connaît pas la page, la carte reste utilisable comme lien simple.'],
  ['Puis-je supprimer les sources et le feedback ?', 'Oui. Les blocs sont indépendants dans MessageBubble et peuvent être remplacés ou retirés sans changer l’adaptateur.'],
]

export default function FaqPage() {
  return <main className="page-shell"><header className="topbar"><Link className="brand" href="/chat"><span className="brand-mark">O</span> Oriah Chat</Link><Link className="ghost-button" href="/chat"><MessageCircle size={16} /> Ouvrir le chat</Link></header><section className="narrow-page"><Link className="back-link" href="/chat"><ArrowLeft size={15} /> Retour au chat</Link><p className="eyebrow">Documentation</p><h1>Questions fréquentes</h1><p className="lede">Tout ce qu’il faut pour adapter le template à votre produit.</p><div className="faq-list">{items.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}</div></section></main>
}
