# IA et protocole de crise

## Rôle d'Elle

Écouter, croire, informer, évaluer le danger et orienter vers une aide humaine réelle. Elle n'est ni la police, ni une psychologue, ni une avocate, et le dit.

La consigne complète est dans `src/lib/elle/prompt.ts`. Principes :

- phrases courtes, 120 mots maximum, une question à la fois ;
- valider d'abord (« je vous crois, ce n'est pas votre faute ») ;
- respecter les choix de la personne : présenter les options, ne pas ordonner ;
- ne jamais demander nom, adresse exacte ou information identifiante ;
- ne jamais inventer un numéro ou un lieu : uniquement l'outil `find_help_resources` ;
- refuser d'aider un agresseur à surveiller ou retrouver une victime.

## Niveaux de danger (`src/lib/elle/risk.ts`)

| Niveau | Exemples de signaux | Réaction de l'interface |
|---|---|---|
| `immediate` | menace de mort, arme, étranglement, agresseur présent, séquestration, idées suicidaires | Urgences affichées avant toute réponse, bannière permanente |
| `high` | coups, viol, violences pendant la grossesse, mariage forcé, mineure | Bannière d'urgence, lieux d'aide ajoutés automatiquement |
| `concern` | menaces, peur, contrôle, insultes, « violences » | Réponse empathique, orientation |
| `none` | — | Accueil |

Le niveau retenu est le plus grave de **toute** la conversation : un danger signalé plus tôt ne disparaît pas.

Les règles sont volontairement larges : un faux positif affiche des numéros d'urgence, un faux négatif peut coûter une vie. Chaque règle est couverte par `tests/risk.test.ts`.

## Garde-fous

| Risque | Mesure |
|---|---|
| IA indisponible, pas de clé, quota dépassé | Réponses hors ligne (`offline.ts`) avec la même détection du danger |
| Refus du modèle | `fallbacks: "default"` côté API, puis réponse hors ligne |
| Numéro inventé | Les lieux viennent exclusivement de l'annuaire local ; la consigne l'interdit |
| Injection de consigne par l'utilisatrice | Le rôle `system` est refusé à l'entrée de l'API ; le contexte est ajouté par le serveur |
| Abus / coûts | 20 requêtes par minute et par IP, 40 messages et 1 500 caractères maximum |
| Conversation interrompue | Le message d'erreur rappelle 117 et 113 |

## Évolutions avant le lancement

1. Faire relire la consigne par une association spécialisée (ALVF, délégation MINPROFF).
2. Constituer un jeu de 100 conversations de test (avec l'association) et mesurer : présence des urgences quand il le faut, absence d'information inventée, ton.
3. Ajouter un relais humain (conseillère d'une association) pour les situations `immediate`.
4. Ajouter les langues locales (fulfulde, ewondo, duala) avec des locutrices.
