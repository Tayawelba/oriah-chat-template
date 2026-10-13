# Oriah Elle

**Assistante d'intelligence artificielle gratuite et confidentielle pour les femmes et les filles victimes de violences au Cameroun.**
Elle écoute, informe, évalue le danger et oriente vers une aide réelle (police, santé, accompagnement, justice) à Yaoundé, Douala, Buea, Bamenda, Maroua et Garoua, avec pour objectif de contribuer à prévenir les féminicides.

Un produit d'**Oriah Technologies SARL** (RC/YAO/2025/B/222).

## Fonctionnalités

| Fonction | Où | Détail |
|---|---|---|
| Discussion avec Elle | `/chat` | IA Claude, réponses en streaming, en français, anglais ou pidgin |
| Détection du danger | serveur | Règles locales déterministes (menace de mort, arme, étranglement, idées suicidaires…), indépendantes de l'IA |
| Urgences prioritaires | partout | 117 / 113 / 118 cliquables, affichés automatiquement si le danger est élevé |
| Annuaire des lieux d'aide | `/aide` | 6 villes, filtres par type, itinéraire Google Maps |
| Évaluation du danger | `/securite` | 12 questions inspirées du *Danger Assessment* (J. Campbell) + plan de sécurité |
| Droits et démarches | `/droits` | Plainte, certificat médical, Code pénal, enfants |
| Sortie rapide | en-tête | Bouton « Quitter » et double appui sur Échap ; l'historique ne permet pas de revenir |
| Mode discret | `/`, `/faq` | Le site s'affiche comme « Mes notes » |
| Mode hors ligne | serveur | Sans clé API ou si l'IA est indisponible, des réponses préparées prennent le relais |

Aucune conversation n'est enregistrée : ni base de données, ni cookie, ni `localStorage` pour les messages.

## Démarrer

Prérequis : Node.js 20 ou plus.

```bash
npm install
cp .env.example .env.local   # puis renseigner ANTHROPIC_API_KEY (facultatif)
npm run dev
```

Ouvrir http://localhost:3000. Sans clé API, l'application fonctionne en mode hors ligne.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm start` | Build et serveur de production |
| `npm test` | Tests unitaires (Vitest) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — composants, flux d'une conversation, protocole d'événements
- [IA et protocole de crise](docs/IA-ET-PROTOCOLE-DE-CRISE.md) — consignes d'Elle, niveaux de danger, garde-fous
- [Sécurité et confidentialité](docs/SECURITE-ET-CONFIDENTIALITE.md) — menaces prises en compte, données, en-têtes
- [Annuaire](docs/ANNUAIRE.md) — vérifier et ajouter des lieux d'aide
- [Déploiement](docs/DEPLOIEMENT.md) — Vercel, variables d'environnement, coûts
- [Business Model Canvas](docs/BUSINESS-MODEL-CANVAS.md) — modèle économique
- [Feuille de route](docs/FEUILLE-DE-ROUTE.md) — prochaines étapes

## Avant un lancement public

1. Vérifier chaque fiche de l'annuaire et les numéros d'urgence (voir `docs/ANNUAIRE.md`).
2. Faire relire `SYSTEM_PROMPT` et la page `/droits` par une association partenaire et un·e juriste.
3. Tester avec un panel d'utilisatrices accompagnées par une association.

## Licence

MIT — © 2026 Oriah Technologies.
