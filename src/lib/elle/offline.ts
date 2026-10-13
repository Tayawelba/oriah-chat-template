import { assessConversation, isAtLeast, type RiskAssessment } from './risk'
import { cityLabel, detectCity, EMERGENCY_NUMBERS, findResources, type CityId, type HelpResource } from './resources'
import { normalize } from './text'

/**
 * Réponses sans IA : utilisées quand aucune clé API n'est configurée ou quand le service d'IA est indisponible.
 * Elles doivent rester utiles seules — une femme en danger ne doit jamais tomber sur un écran d'erreur.
 */
export type OfflineReply = { text: string; resources: HelpResource[] }

type Intent = 'complaint' | 'medical' | 'rights' | 'places' | 'safety-plan' | 'greeting' | 'children' | 'other'

const INTENTS: { intent: Intent; pattern: RegExp }[] = [
  { intent: 'complaint', pattern: /\b(plainte|porter plainte|commissariat|gendarmerie|police|procureur|denoncer|report)\b/ },
  { intent: 'medical', pattern: /\b(certificat|medecin|hopital|soins|blessure|enceinte|pilule|contracep|vih|hiv)\b/ },
  { intent: 'rights', pattern: /\b(droit|droits|loi|code penal|avocat|divorce|garde des enfants|juridique)\b/ },
  { intent: 'places', pattern: /\b(ou aller|adresse|lieu|lieux|centre|association|aide pres|ou trouver|numero|where)\b/ },
  { intent: 'safety-plan', pattern: /\b(partir|quitter|fuir|plan de securite|me proteger|proteger|cacher|safe)\b/ },
  { intent: 'children', pattern: /\b(enfant|enfants|ma fille|mon fils|bebe)\b/ },
  { intent: 'greeting', pattern: /^(bonjour|bonsoir|salut|hello|hi|coucou|bjr|slt)\b/ },
]

function detectIntents(text: string): Intent[] {
  const normalized = normalize(text)
  const found = INTENTS.filter(({ pattern }) => pattern.test(normalized)).map(({ intent }) => intent)
  return found.length ? found : ['other']
}

function emergencyBlock(): string {
  return [
    'Si vous êtes en danger maintenant :',
    '• Appelez la Police au 117 ou la Gendarmerie au 113 (gratuit, 24 h/24).',
    '• Si vous pouvez, allez dans un lieu où il y a du monde : voisins, boutique, église, mosquée.',
    '• Ne restez pas dans une pièce sans issue ou avec des objets dangereux (cuisine).',
  ].join('\n')
}

const ANSWERS: Record<Exclude<Intent, 'other' | 'greeting'>, string> = {
  complaint: [
    'Porter plainte, c’est votre droit, et personne ne peut vous y obliger ni vous en empêcher.',
    '• Vous pouvez aller au commissariat ou à la brigade de gendarmerie la plus proche, ou écrire directement au Procureur de la République (tribunal de première instance).',
    '• Apportez ce que vous avez : certificat médical, photos des blessures, messages de menace, noms de témoins.',
    '• Vous avez le droit de venir accompagnée d’une personne de confiance ou d’une association.',
    '• Demandez une copie ou un récépissé de votre plainte.',
  ].join('\n'),
  medical: [
    'Votre santé passe en premier.',
    '• Allez dans un hôpital ou un centre de santé et dites que vous avez été frappée ou agressée. Demandez un certificat médical : c’est une preuve importante si vous portez plainte, même plus tard.',
    '• Après une agression sexuelle, essayez d’y aller dans les 72 heures : un traitement peut éviter une grossesse et protéger contre le VIH.',
    '• Si possible, ne vous lavez pas et gardez vos vêtements dans un sac en papier : ce sont des preuves.',
  ].join('\n'),
  rights: [
    'Au Cameroun, la loi punit les violences, même au sein du couple ou de la famille.',
    '• Les coups et blessures, le viol, le harcèlement sexuel et le mariage forcé sont des infractions prévues par le Code pénal.',
    '• Être mariée ne donne à personne le droit de vous frapper ou de vous forcer.',
    '• Une association ou une délégation du MINPROFF peut vous orienter vers une aide juridique.',
    'Consultez la page « Mes droits » pour plus de détails.',
  ].join('\n'),
  places: 'Voici des lieux qui peuvent vous aider. Appelez avant de vous déplacer si vous le pouvez, et dites seulement ce que vous voulez dire.',
  'safety-plan': [
    'Préparer votre sécurité à l’avance peut vous sauver la vie :',
    '• Préparez discrètement un petit sac : pièces d’identité (CNI, actes de naissance des enfants), un peu d’argent, médicaments, un chargeur.',
    '• Gardez-le chez une personne de confiance si c’est trop risqué chez vous.',
    '• Choisissez un mot code avec une proche : si vous l’envoyez, elle appelle la police.',
    '• Repérez où aller : famille, amie, centre d’accueil.',
    'La page « Ma sécurité » vous aide à faire votre plan pas à pas.',
  ].join('\n'),
  children: [
    'Vos enfants aussi ont droit à la protection.',
    '• Les enfants exposés aux violences souffrent, même s’ils ne sont pas frappés.',
    '• Si un enfant est en danger, la police (117) et les services sociaux doivent intervenir.',
    '• Si vous partez, emmenez si possible les enfants et leurs actes de naissance.',
  ].join('\n'),
}

function askCity(city: CityId | null): string {
  return city ? '' : '\n\nDans quelle ville êtes-vous (Yaoundé, Douala, Buea, Bamenda, Maroua, Garoua) ? Je pourrai vous indiquer des lieux d’aide près de chez vous.'
}

export function offlineReply(userMessages: string[], options: { city?: CityId | null; risk?: RiskAssessment } = {}): OfflineReply {
  const last = userMessages.at(-1) ?? ''
  const risk = options.risk ?? assessConversation(userMessages)
  const city = options.city ?? detectCity(userMessages.join(' '))
  const intents = detectIntents(last)
  const parts: string[] = []
  let resources: HelpResource[] = []

  if (risk.selfHarm) {
    parts.push(
      'Merci de me l’avoir dit. Ce que vous ressentez est très lourd, et vous méritez d’être aidée tout de suite.',
      'Appelez maintenant le 117 ou rendez-vous aux urgences de l’hôpital le plus proche. Si vous le pouvez, prévenez une personne de confiance et ne restez pas seule.',
    )
    resources = [...EMERGENCY_NUMBERS, ...findResources({ city, categories: ['sante'] }).filter((r) => r.city)]
  } else if (risk.level === 'immediate') {
    parts.push('Ce que vous décrivez est très grave. Votre vie peut être en danger, et ce n’est pas de votre faute.', emergencyBlock())
    resources = [...EMERGENCY_NUMBERS, ...findResources({ city, categories: ['police', 'sante'] }).filter((r) => r.city)]
  } else if (intents.includes('greeting') && risk.level === 'none') {
    parts.push(
      'Bonjour, je suis Elle. Ici, vous pouvez parler librement, sans être jugée. Rien n’est enregistré sur votre téléphone.',
      'Vous pouvez me raconter ce qui se passe, ou me demander : où trouver de l’aide, comment porter plainte, comment vous protéger.',
    )
  } else {
    if (isAtLeast(risk.level, 'high')) {
      parts.push('Je vous crois. Ce que vous vivez est une violence, c’est interdit par la loi, et ce n’est jamais de votre faute.')
    } else if (risk.level === 'concern') {
      parts.push('Merci de me faire confiance. Ce que vous décrivez peut être une forme de violence. Vous avez le droit de vous sentir en sécurité.')
    }
    for (const intent of intents) {
      if (intent === 'other' || intent === 'greeting') continue
      parts.push(ANSWERS[intent])
    }
    if (intents.includes('places') || intents.includes('complaint') || isAtLeast(risk.level, 'high')) {
      resources = findResources({ city, categories: ['urgence', 'police', 'sante', 'accompagnement', 'juridique'] }).filter(
        (resource) => city || resource.city === null,
      )
    }
    if (parts.length === 0) {
      parts.push(
        'Je suis là pour vous écouter. Pouvez-vous m’en dire un peu plus sur ce qui se passe ? Vous pouvez aussi me demander où trouver de l’aide, comment porter plainte ou comment vous protéger.',
      )
    }
    if (isAtLeast(risk.level, 'high')) parts.push(emergencyBlock())
  }

  if (resources.length && city) parts.push(`Lieux d’aide à ${cityLabel(city)} ci-dessous.`)
  const text = parts.join('\n\n') + (risk.selfHarm ? '' : askCity(city))
  return { text, resources }
}
