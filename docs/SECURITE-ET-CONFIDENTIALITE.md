# Sécurité et confidentialité

## Menaces prises en compte

| Menace | Mesure |
|---|---|
| L'agresseur regarde le téléphone | Bouton « Quitter » (`location.replace` vers une recherche Google ordinaire), double Échap, mode discret « Mes notes », conversation jamais stockée |
| L'agresseur consulte l'historique | Conseils de navigation privée ; la sortie rapide remplace l'entrée courante de l'historique (les pages vues avant restent : le dire aux utilisatrices) |
| Fuite de données côté serveur | Aucune base de données, aucun texte de conversation dans les journaux |
| Interception réseau | HTTPS obligatoire (HSTS) |
| Intégration du site dans une autre page | `X-Frame-Options: DENY` |
| Fuite via l'en-tête Referer vers Google Maps | `Referrer-Policy: no-referrer` |
| Abus de l'API (coûts) | Limite de débit, taille des messages bornée |

## Données

| Donnée | Où | Durée |
|---|---|---|
| Messages | Mémoire de la page, puis transit chiffré vers le serveur et Anthropic | Le temps de la requête ; rien n'est écrit sur disque par Oriah Elle |
| Adresse IP | Mémoire du serveur (limiteur) | 1 minute |
| Préférence « mode discret » | `localStorage` (clé neutre `n.pref`) | Jusqu'à désactivation |

Les conditions de conservation des données par Anthropic dépendent du contrat API : vérifier l'option de non-conservation (zero data retention) avant le lancement.

## En-têtes HTTP (`next.config.mjs`)

`Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy` (caméra, micro, géolocalisation désactivés), `Strict-Transport-Security`.

## Conformité

- Loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité au Cameroun : minimisation des données, pas de collecte d'identité.
- Toute future fonction qui stocke des données (comptes conseillères, statistiques) doit faire l'objet d'une analyse d'impact.

## Signaler une faille

Écrire à l'équipe d'Oriah Technologies en privé ; ne pas ouvrir de ticket public.
