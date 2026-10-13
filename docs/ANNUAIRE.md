# Annuaire des lieux d'aide

Fichier : `src/lib/elle/resources.ts`.

## État actuel

- 6 villes : Yaoundé, Douala, Buea, Bamenda, Maroua, Garoua.
- Par ville : hôpitaux de référence, commissariat central, délégation régionale du MINPROFF, Centre de Promotion de la Femme et de la Famille, parquet du tribunal de première instance.
- Numéros nationaux : Police 117, Gendarmerie 113, Sapeurs-pompiers 118.
- **Toutes les fiches ont `verified: false`.** Les noms de structures sont publics, mais aucun numéro local n'a été ajouté : un numéro faux dans un outil d'urgence est dangereux.

## Vérifier une fiche

1. Appeler la structure ou s'y rendre.
2. Confirmer : nom exact, adresse, téléphone, horaires, services pour les femmes victimes, gratuité.
3. Renseigner `address`, `phone`, et passer `verified: true`.
4. Noter dans le message de commit : date, personne qui a vérifié, moyen (appel ou visite).
5. Mettre à jour le test « ne marque aucune fiche comme vérifiée » dans `tests/resources.test.ts` pour qu'il vérifie plutôt que les fiches vérifiées ont un téléphone ou une adresse.

Revérifier chaque fiche **tous les 6 mois**.

## Ajouter une fiche

```ts
{
  id: 'douala-association-x',      // unique
  name: 'Nom officiel',
  category: 'accompagnement',      // urgence | police | sante | accompagnement | juridique | hebergement
  city: 'douala',
  description: 'Ce que la structure propose, en une phrase simple.',
  address: 'Quartier, repère',
  phone: '6XXXXXXXX',
  mapQuery: 'Nom officiel Douala',
  verified: true,
}
```

## Partenaires à contacter en priorité

- Délégations régionales du MINPROFF (6 villes).
- ALVF (Association de Lutte contre les Violences faites aux Femmes).
- Hôpitaux de référence : protocole de prise en charge des victimes de violences sexuelles.
- Centres d'hébergement d'urgence (catégorie `hebergement`, vide aujourd'hui).
