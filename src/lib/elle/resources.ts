import { normalize } from './text'

export type CityId = 'yaounde' | 'douala' | 'buea' | 'bamenda' | 'maroua' | 'garoua'

export type ResourceCategory = 'urgence' | 'police' | 'sante' | 'accompagnement' | 'juridique' | 'hebergement'

export type HelpResource = {
  id: string
  name: string
  category: ResourceCategory
  /** null = service national joignable partout. */
  city: CityId | null
  description: string
  address?: string
  phone?: string
  /** Requête envoyée à Google Maps pour l'itinéraire. */
  mapQuery?: string
  /**
   * false tant qu'un membre de l'équipe n'a pas confirmé le numéro et l'adresse par téléphone ou sur place.
   * Voir docs/ANNUAIRE.md : aucune fiche ne doit passer à true sans vérification réelle.
   */
  verified: boolean
}

export const CITIES: { id: CityId; label: string; region: string; aliases: string[] }[] = [
  { id: 'yaounde', label: 'Yaoundé', region: 'Centre', aliases: ['yaounde', 'yde', 'ydé', 'mfoundi'] },
  { id: 'douala', label: 'Douala', region: 'Littoral', aliases: ['douala', 'dla', 'wouri'] },
  { id: 'buea', label: 'Buea', region: 'Sud-Ouest', aliases: ['buea', 'fako'] },
  { id: 'bamenda', label: 'Bamenda', region: 'Nord-Ouest', aliases: ['bamenda', 'mezam'] },
  { id: 'maroua', label: 'Maroua', region: 'Extrême-Nord', aliases: ['maroua', 'diamare'] },
  { id: 'garoua', label: 'Garoua', region: 'Nord', aliases: ['garoua', 'benoue'] },
]

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  urgence: 'Urgences',
  police: 'Police et gendarmerie',
  sante: 'Soins et certificat médical',
  accompagnement: 'Écoute et accompagnement',
  juridique: 'Aide juridique',
  hebergement: 'Mise à l’abri',
}

export function cityLabel(id: CityId): string {
  return CITIES.find((city) => city.id === id)?.label ?? id
}

/** Numéros d'urgence nationaux, affichés en priorité quand le danger est immédiat. */
export const EMERGENCY_NUMBERS: HelpResource[] = [
  {
    id: 'police-117',
    name: 'Police secours',
    category: 'urgence',
    city: null,
    phone: '117',
    description: 'Appel gratuit, 24 h/24. Pour un danger immédiat ou un agresseur présent.',
    verified: false,
  },
  {
    id: 'gendarmerie-113',
    name: 'Gendarmerie',
    category: 'urgence',
    city: null,
    phone: '113',
    description: 'Appel gratuit, 24 h/24. Particulièrement utile hors des centres-villes.',
    verified: false,
  },
  {
    id: 'pompiers-118',
    name: 'Sapeurs-pompiers',
    category: 'urgence',
    city: null,
    phone: '118',
    description: 'Blessure grave, incendie, personne inconsciente.',
    verified: false,
  },
]

type CityTemplate = { hospitals: string[] }

const CITY_TEMPLATES: Record<CityId, CityTemplate> = {
  yaounde: { hospitals: ['Hôpital Central de Yaoundé', 'Hôpital Gynéco-Obstétrique et Pédiatrique de Yaoundé'] },
  douala: { hospitals: ['Hôpital Laquintinie de Douala', 'Hôpital Général de Douala'] },
  buea: { hospitals: ['Buea Regional Hospital'] },
  bamenda: { hospitals: ['Bamenda Regional Hospital'] },
  maroua: { hospitals: ['Hôpital Régional de Maroua'] },
  garoua: { hospitals: ['Hôpital Régional de Garoua'] },
}

function cityResources(city: CityId): HelpResource[] {
  const label = cityLabel(city)
  const hospitals = CITY_TEMPLATES[city].hospitals.map<HelpResource>((name, index) => ({
    id: `${city}-hopital-${index + 1}`,
    name,
    category: 'sante',
    city,
    description:
      'Soins en urgence et certificat médical (preuve importante pour une plainte). Venir de préférence dans les 72 heures après une agression sexuelle.',
    mapQuery: `${name}, ${label}, Cameroun`,
    verified: false,
  }))

  return [
    ...hospitals,
    {
      id: `${city}-commissariat`,
      name: `Commissariat central de ${label}`,
      category: 'police',
      city,
      description: 'Dépôt de plainte, protection en cas de danger. Vous pouvez venir accompagnée.',
      mapQuery: `Commissariat central ${label} Cameroun`,
      verified: false,
    },
    {
      id: `${city}-minproff`,
      name: `Délégation régionale du MINPROFF (${label})`,
      category: 'accompagnement',
      city,
      description:
        'Ministère de la Promotion de la Femme et de la Famille : écoute, orientation, médiation et accompagnement des femmes victimes.',
      mapQuery: `Délégation MINPROFF ${label} Cameroun`,
      verified: false,
    },
    {
      id: `${city}-cpff`,
      name: `Centre de Promotion de la Femme et de la Famille (${label})`,
      category: 'accompagnement',
      city,
      description: 'Structure publique de proximité : écoute, information sur vos droits, orientation vers les services.',
      mapQuery: `Centre de Promotion de la Femme et de la Famille ${label}`,
      verified: false,
    },
    {
      id: `${city}-tribunal`,
      name: `Parquet du Tribunal de Première Instance de ${label}`,
      category: 'juridique',
      city,
      description: 'Vous pouvez adresser une plainte directement au Procureur de la République.',
      mapQuery: `Tribunal de Première Instance ${label} Cameroun`,
      verified: false,
    },
  ]
}

const ASSOCIATIONS: HelpResource[] = [
  {
    id: 'yaounde-alvf',
    name: 'ALVF – Association de Lutte contre les Violences faites aux Femmes',
    category: 'accompagnement',
    city: 'yaounde',
    description: 'Association camerounaise : écoute, accompagnement psychologique et juridique des femmes victimes.',
    mapQuery: 'ALVF Association de Lutte contre les Violences faites aux Femmes Yaoundé',
    verified: false,
  },
]

export const DIRECTORY: HelpResource[] = [
  ...EMERGENCY_NUMBERS,
  ...CITIES.flatMap((city) => cityResources(city.id)),
  ...ASSOCIATIONS,
]

export function mapUrl(resource: HelpResource): string | null {
  if (!resource.mapQuery) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.mapQuery)}`
}

export function findResources(options: { city?: CityId | null; categories?: ResourceCategory[] } = {}): HelpResource[] {
  const { city, categories } = options
  return DIRECTORY.filter((resource) => {
    if (categories?.length && !categories.includes(resource.category)) return false
    if (resource.city === null) return true
    return city ? resource.city === city : true
  })
}

/** Repère une des six villes couvertes dans un texte libre. */
export function detectCity(text: string): CityId | null {
  const normalized = normalize(text)
  for (const city of CITIES) {
    if (city.aliases.some((alias) => new RegExp(`\\b${normalize(alias)}\\b`).test(normalized))) return city.id
  }
  return null
}

export function isCityId(value: unknown): value is CityId {
  return typeof value === 'string' && CITIES.some((city) => city.id === value)
}

export function isCategory(value: unknown): value is ResourceCategory {
  return typeof value === 'string' && value in CATEGORY_LABELS
}
