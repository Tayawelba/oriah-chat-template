# Déploiement

## Vercel (recommandé pour démarrer)

1. Importer le dépôt GitHub dans Vercel.
2. Variables d'environnement (Production) :
   - `ANTHROPIC_API_KEY` : clé de https://console.anthropic.com
   - `ORIAH_ELLE_MODEL` : `claude-opus-5-5` (par défaut)
   - `ORIAH_ELLE_EFFORT` : `medium`
3. Déployer. Domaine conseillé : neutre (ex. `elle.oriah.cm`), sans mot évoquant la violence.

Sans `ANTHROPIC_API_KEY`, le site fonctionne en mode hors ligne.

## Autre hébergement (VPS, Docker)

```bash
npm ci
npm run build
PORT=3000 npm start
```

Placer derrière un reverse proxy HTTPS (Caddy, Nginx) qui transmet `X-Forwarded-For`.

## Limite de débit en production

`src/lib/elle/rate-limit.ts` garde les compteurs en mémoire : valable pour une seule instance. Sur plusieurs instances ou en serverless, utiliser un stockage partagé (Upstash Redis, Vercel KV).

## Coûts estimés de l'IA

Tarifs Anthropic (octobre 2026, par million de tokens) : `claude-opus-5-5` 4 $ en entrée / 20 $ en sortie ; `claude-haiku-5-5` 0,10 $ / 0,50 $.

Une conversation type (8 échanges, consigne mise en cache) consomme environ 30 000 tokens d'entrée et 2 500 de sortie :

| Modèle | Coût par conversation | 10 000 conversations / mois |
|---|---|---|
| `claude-opus-5-5` | ≈ 0,17 $ | ≈ 1 700 $ |
| `claude-haiku-5-5` | ≈ 0,004 $ | ≈ 40 $ |

Ces chiffres sont des ordres de grandeur à mesurer en conditions réelles. Avant de passer à un modèle moins cher, comparer les réponses sur le jeu de conversations de test (voir `IA-ET-PROTOCOLE-DE-CRISE.md`).

## Vérifications après déploiement

- `/chat` : envoyer « il va me tuer » → urgences affichées immédiatement.
- Bouton « Quitter » → page Google, retour arrière impossible vers la conversation.
- En-têtes : `curl -I https://votre-domaine/` doit montrer `referrer-policy: no-referrer`.
