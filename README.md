# Oriah Chat Template

Une interface de chat Next.js modulaire et open source, conçue pour être branchée sur n'importe quel backend conversationnel.

## Fonctionnalités

- Interface responsive mobile-first avec sidebar pliable.
- État vide, suggestions, streaming, arrêt de génération et nouveau chat.
- Erreurs réseau, erreur serveur, connexion interrompue et bouton de reconnexion.
- Aperçus de liens avec domaine, titre, description et favicon.
- Sources citées regroupées dans chaque réponse.
- Feedback positif/négatif, copie, partage, son de notification et thème sombre.
- Pages `/chat`, `/faq`, `/privacy` et `/showcase` pour vérifier les états UI.
- `ChatAdapter` isolé dans `src/lib/chat/adapter.ts` : mock fourni, backend HTTP facilement remplaçable.

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000/chat.

Le mode démonstration fonctionne sans clé API. Pour connecter un backend, remplacez `demoAdapter` par `httpAdapter` dans `src/components/chat/chat-shell.tsx` ou implémentez votre propre `ChatAdapter`.

## Contrat d'adaptateur

```ts
export interface ChatAdapter {
  sendMessage(input: { messages: ChatMessage[]; signal: AbortSignal }): AsyncGenerator<ChatEvent>
}
```

L'adaptateur émet `text`, `sources`, `link`, `error` puis `done`. Les données reçues du backend restent ainsi indépendantes de l'interface.

## Publication GitHub

Le dépôt ne contient aucun secret. Avant publication : renseigner le nom de l'organisation dans `LICENSE`, choisir la licence finale, puis lancer `npm run typecheck`, `npm run lint` et `npm run build`.
