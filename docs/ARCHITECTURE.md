# Architecture

## Vue d'ensemble

```
Navigateur (Next.js, React)                      Serveur (Next.js route /api/chat, Node.js)
┌──────────────────────────────┐   POST JSON     ┌───────────────────────────────────────────┐
│ ChatExperience               │ ──────────────▶ │ parseChatRequest  (validation)            │
│  - messages en mémoire       │                 │ rate limit (20 req/min/IP)                │
│  - ville choisie             │                 │ runChat                                   │
│  - bannière d'urgence        │ ◀────────────── │  1. assessConversation → event "risk"     │
│ httpAdapter (lecture NDJSON) │   NDJSON        │  2. urgences si danger immédiat           │
└──────────────────────────────┘   (streaming)   │  3. Claude + outil find_help_resources    │
                                                 │     ou offlineReply si pas d'IA           │
                                                 │  4. event "done"                          │
                                                 └───────────────────────────────────────────┘
```

## Arborescence

| Chemin | Rôle |
|---|---|
| `src/app/` | Pages (App Router) : `/`, `/chat`, `/aide`, `/securite`, `/droits`, `/faq`, `/confidentialite`, route `api/chat` |
| `src/components/chat/ChatExperience.tsx` | Écran de discussion |
| `src/components/elle/` | En-tête + sortie rapide, carte d'urgence, fiche de lieu, mode discret |
| `src/lib/chat/` | Types partagés et client HTTP (`httpAdapter`) |
| `src/lib/elle/risk.ts` | Détection du danger par règles |
| `src/lib/elle/resources.ts` | Annuaire, villes, recherche |
| `src/lib/elle/offline.ts` | Réponses sans IA |
| `src/lib/elle/prompt.ts` | Consigne système d'Elle |
| `src/lib/elle/engine.ts` | Orchestration : validation, IA, outil, repli |
| `src/lib/elle/assessment.ts` | Score de l'évaluation du danger |
| `src/lib/elle/rate-limit.ts` | Limiteur de débit en mémoire |
| `tests/` | Tests Vitest |

## Protocole `/api/chat`

Requête :

```json
{ "messages": [{ "role": "user", "content": "..." }], "city": "douala" }
```

- 1 à 40 messages, le dernier vient de l'utilisatrice, 1 500 caractères maximum par message utilisatrice.
- `city` : `yaounde | douala | buea | bamenda | maroua | garoua`, ou absent.

Réponse : `application/x-ndjson`, un objet JSON par ligne.

| Événement | Quand |
|---|---|
| `{"type":"risk","risk":{level,signals,selfHarm}}` | Toujours en premier |
| `{"type":"resources","resources":[...]}` | Urgences dès le début si danger immédiat ; liste complète après l'appel d'outil. Chaque envoi remplace le précédent |
| `{"type":"text","delta":"..."}` | Morceaux de la réponse |
| `{"type":"error","message":"...","kind":"..."}` | Interruption après un début de réponse |
| `{"type":"done","mode":"ai"\|"offline"}` | Fin |

Codes HTTP : `400` requête invalide, `429` trop de requêtes (en-tête `retry-after`).

## Flux d'une réponse IA

1. Le serveur calcule le niveau de danger sur **tous** les messages de l'utilisatrice.
2. Il ajoute à la fin de la conversation un message `system` (non visible) avec ce niveau et la ville.
3. Appel en streaming à Claude (`client.beta.messages.stream`) avec :
   - consigne système mise en cache (`cache_control`),
   - outil `find_help_resources` (`strict: true`),
   - `output_config.effort` (variable `ORIAH_ELLE_EFFORT`),
   - `fallbacks: "default"` : si le modèle refuse, l'API relance sur un modèle de repli.
4. Si Claude appelle l'outil, le serveur interroge l'annuaire local, envoie les fiches à l'interface et renvoie le résultat à Claude (jusqu'à 3 tours).
5. Si le danger est élevé et qu'aucun lieu local n'a été proposé, le serveur en ajoute.
6. En cas d'erreur ou de refus **avant** le premier mot, la réponse hors ligne est utilisée ; après, un message d'erreur rappelle les urgences.

## Choix techniques

- **Next.js 15 + React 19 + Tailwind 4** : base existante d'Oriah Chat Template.
- **SDK officiel `@anthropic-ai/sdk`** côté serveur uniquement ; la clé n'est jamais envoyée au navigateur.
- **Détection du danger hors IA** : l'affichage des urgences ne dépend ni du réseau vers l'IA ni de son jugement.
- **Pas de base de données** : rien à fuiter, rien à saisir.
