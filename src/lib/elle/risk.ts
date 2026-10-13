import { normalize } from './text'

/**
 * Niveaux de danger, du plus faible au plus grave.
 * - none      : aucun signal détecté
 * - concern   : violences psychologiques, contrôle, peur
 * - high      : violences physiques ou sexuelles
 * - immediate : danger de mort ou agresseur présent — afficher les urgences tout de suite
 */
export type RiskLevel = 'none' | 'concern' | 'high' | 'immediate'

export type RiskSignal = { id: string; label: string; level: Exclude<RiskLevel, 'none'> }

export type RiskAssessment = { level: RiskLevel; signals: RiskSignal[]; selfHarm: boolean }

type Rule = RiskSignal & { patterns: RegExp[] }

// Les motifs portent sur un texte normalisé (minuscules, sans accents).
// Ils couvrent le français, l'anglais et quelques tournures de pidgin camerounais.
const RULES: Rule[] = [
  {
    id: 'threat-to-kill',
    label: 'Menace de mort',
    level: 'immediate',
    patterns: [
      /\b(va|veut|vais|voulait|menace de|menace|promet de|jure de) (me|nous|la|les) tuer\b/,
      /\bmenaces? de mort\b/,
      /\b(il|elle|he|she) (will|wants to|is going to|go) kill (me|us)\b/,
      /\bkill me\b/,
      /\bgo kill me\b/,
      /\bme tuer\b.*\b(il|mon mari|mon copain|mon fiance|mon pere|mon frere)\b/,
      /\b(il|mon mari|mon copain|mon fiance|mon pere|mon frere)\b.*\bme tuer\b/,
    ],
  },
  {
    id: 'weapon',
    label: 'Arme',
    level: 'immediate',
    patterns: [/\b(couteau|machette|fusil|pistolet|arme|revolver|knife|gun|cutlass|matchet)\b/],
  },
  {
    id: 'strangulation',
    label: 'Étranglement',
    level: 'immediate',
    patterns: [/\betrangl|\bm'a serre (le cou|la gorge)|\bstrangl|\bchok(ed|ing) me\b|\bserre (mon|le) cou\b/],
  },
  {
    id: 'aggressor-present',
    label: 'Agresseur présent ou séquestration',
    level: 'immediate',
    patterns: [
      /\b(il|he) (est|is) (la|devant|dehors|here|outside|derriere la porte)\b/,
      /\b(enfermee?|sequestree?|locked (me )?in|il m'a enfermee?)\b/,
      /\b(il|he) (arrive|revient|is coming)\b/,
      /\b(au secours|help me|aidez[- ]moi vite|urgence)\b/,
    ],
  },
  {
    id: 'self-harm',
    label: 'Idées suicidaires',
    level: 'immediate',
    patterns: [
      /\b(me suicider|suicide|en finir|mettre fin a (ma|mes) (vie|jours)|je veux mourir|plus envie de vivre|kill myself|end my life|want to die)\b/,
    ],
  },
  {
    id: 'sexual-violence',
    label: 'Violence sexuelle',
    level: 'high',
    patterns: [
      /\b(viol|violee?|violer|rape|raped|abuse[ds]? sexuel|attouchement|forcee? a coucher|force(d)? me to have sex|agression sexuelle)\b/,
    ],
  },
  {
    id: 'physical-violence',
    label: 'Violence physique',
    level: 'high',
    patterns: [
      /\b(frapp|battu|me bat\b|il bat\b|gifl|coups\b|coup de (poing|pied|tete|ceinture|machette|baton)|tabass|cogn|bless|saign|brul|pousse contre|beat|beaten|hit me|hits me|slap|punch|kick)/,
    ],
  },
  {
    id: 'pregnancy-violence',
    label: 'Violence pendant la grossesse',
    level: 'high',
    patterns: [/\benceinte\b.*\b(frapp|battu|coups?|tap)|\b(frapp|battu|coups?)\b.*\benceinte\b/, /\bpregnant\b.*\b(hit|beat)/],
  },
  {
    id: 'forced-marriage',
    label: 'Mariage forcé',
    level: 'high',
    patterns: [/\b(mariage force|marier de force|veut me marier|forced marriage|force me to marry)\b/],
  },
  {
    id: 'minor',
    label: 'Mineure concernée',
    level: 'high',
    patterns: [/\b(j'ai|j ai) (1[0-7]|[89]) ans\b/, /\bi am (1[0-7]|[89])( years old)?\b/],
  },
  {
    id: 'child-mentioned',
    label: 'Enfant concerné',
    level: 'concern',
    patterns: [/\b(ma fille|ma petite soeur|ma niece|une enfant|une mineure|une petite fille|mes enfants)\b/],
  },
  {
    id: 'threats',
    label: 'Menaces',
    level: 'concern',
    patterns: [/\bmenac|\bthreat/],
  },
  {
    id: 'fear',
    label: 'Peur',
    level: 'concern',
    patterns: [/\b(j'ai peur|j ai peur|peur de (lui|rentrer|mon mari)|i'?m scared|i am afraid|afraid of him)\b/],
  },
  {
    id: 'control',
    label: 'Contrôle et isolement',
    level: 'concern',
    patterns: [
      /\b(controle mon telephone|fouille mon telephone|m'interdit|m interdit|m'empeche de sortir|m empeche de sortir|isole|jaloux|jalouse|prend mon argent|confisque|check(s)? my phone|won'?t let me)\b/,
    ],
  },
  {
    id: 'psychological-violence',
    label: 'Violence psychologique',
    level: 'concern',
    patterns: [/\b(insult|humili|rabaiss|crie sur moi|me traite de|harcel|harass|insults? me)/],
  },
  {
    id: 'violence-reported',
    label: 'Violences déclarées',
    level: 'concern',
    patterns: [/\b(violence|violent|abus|maltrait|abuse|abusive)/],
  },
]

const ORDER: Record<RiskLevel, number> = { none: 0, concern: 1, high: 2, immediate: 3 }

export function maxLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  return ORDER[a] >= ORDER[b] ? a : b
}

export function isAtLeast(level: RiskLevel, threshold: RiskLevel): boolean {
  return ORDER[level] >= ORDER[threshold]
}

/** Évalue un message. Déterministe et sans réseau : ne dépend jamais du modèle d'IA. */
export function assessRisk(text: string): RiskAssessment {
  const normalized = normalize(text)
  const signals = RULES.filter((rule) => rule.patterns.some((pattern) => pattern.test(normalized))).map(
    ({ id, label, level }) => ({ id, label, level }),
  )
  const level = signals.reduce<RiskLevel>((current, signal) => maxLevel(current, signal.level), 'none')
  return { level, signals, selfHarm: signals.some((signal) => signal.id === 'self-harm') }
}

/** Évalue toute la conversation de l'utilisatrice : un danger signalé plus tôt reste valable. */
export function assessConversation(userMessages: string[]): RiskAssessment {
  const seen = new Map<string, RiskSignal>()
  let selfHarm = false
  for (const message of userMessages) {
    const result = assessRisk(message)
    selfHarm ||= result.selfHarm
    for (const signal of result.signals) seen.set(signal.id, signal)
  }
  const signals = [...seen.values()]
  const level = signals.reduce<RiskLevel>((current, signal) => maxLevel(current, signal.level), 'none')
  return { level, signals, selfHarm }
}
