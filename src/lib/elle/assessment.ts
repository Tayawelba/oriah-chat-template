/**
 * Évaluation du danger inspirée du « Danger Assessment » de Jacquelyn Campbell (facteurs de risque de féminicide
 * dans le couple), simplifiée pour un usage grand public. Ce n'est pas un outil de diagnostic : il aide à prendre
 * conscience du danger et oriente vers des professionnelles.
 */
export type DangerQuestion = { id: string; text: string; weight: number; critical?: boolean }

export const DANGER_QUESTIONS: DangerQuestion[] = [
  { id: 'escalation', text: 'Les violences sont-elles devenues plus fréquentes ou plus graves ces derniers mois ?', weight: 1 },
  { id: 'death-threat', text: 'A-t-il déjà menacé de vous tuer ?', weight: 3, critical: true },
  { id: 'strangulation', text: 'A-t-il déjà essayé de vous étrangler ou de vous étouffer ?', weight: 3, critical: true },
  { id: 'weapon', text: 'A-t-il une arme (fusil, machette, couteau) ou vous a-t-il déjà menacée avec une arme ?', weight: 3, critical: true },
  { id: 'capable', text: 'Pensez-vous qu’il est capable de vous tuer ?', weight: 3, critical: true },
  { id: 'pregnancy', text: 'Vous a-t-il frappée pendant une grossesse ?', weight: 2 },
  { id: 'separation', text: 'Êtes-vous en train de le quitter, ou l’avez-vous quitté récemment ?', weight: 2 },
  { id: 'sexual', text: 'Vous a-t-il forcée à avoir des rapports sexuels ?', weight: 2 },
  { id: 'children', text: 'A-t-il menacé de faire du mal à vos enfants ?', weight: 2 },
  { id: 'suicide', text: 'A-t-il menacé de se suicider ?', weight: 2 },
  { id: 'control', text: 'Est-il très jaloux et contrôle-t-il vos sorties, votre téléphone ou votre argent ?', weight: 1 },
  { id: 'substances', text: 'Boit-il beaucoup d’alcool ou prend-il de la drogue ?', weight: 1 },
]

export type DangerLevel = 'low' | 'moderate' | 'high' | 'severe'

export type DangerResult = { score: number; maxScore: number; level: DangerLevel; criticalCount: number }

export function scoreDanger(answers: Record<string, boolean>): DangerResult {
  const maxScore = DANGER_QUESTIONS.reduce((total, question) => total + question.weight, 0)
  let score = 0
  let criticalCount = 0
  for (const question of DANGER_QUESTIONS) {
    if (!answers[question.id]) continue
    score += question.weight
    if (question.critical) criticalCount += 1
  }
  // Un seul facteur critique (menace de mort, étranglement, arme, peur d'être tuée) suffit à placer en danger élevé.
  let level: DangerLevel = 'low'
  if (score >= 9 || criticalCount >= 2) level = 'severe'
  else if (score >= 5 || criticalCount === 1) level = 'high'
  else if (score >= 1) level = 'moderate'
  return { score, maxScore, level, criticalCount }
}

export const DANGER_ADVICE: Record<DangerLevel, { title: string; text: string }> = {
  low: {
    title: 'Peu de signaux de danger grave',
    text: 'Vos réponses ne montrent pas de facteur de danger majeur aujourd’hui. Si la situation change, refaites ce test. Vous pouvez parler à Elle à tout moment.',
  },
  moderate: {
    title: 'Des signaux à prendre au sérieux',
    text: 'Certains signes montrent une situation de violence qui peut s’aggraver. Parlez-en à une personne de confiance ou à une structure d’aide, et préparez un plan de sécurité.',
  },
  high: {
    title: 'Danger élevé',
    text: 'Vos réponses montrent un danger important pour votre sécurité. Contactez une structure d’aide rapidement, préparez un plan de sécurité et gardez les numéros d’urgence à portée de main.',
  },
  severe: {
    title: 'Danger très élevé — votre vie peut être menacée',
    text: 'Plusieurs facteurs connus pour précéder les féminicides sont présents. Ne restez pas seule face à cela : appelez le 117 ou le 113 si vous êtes menacée maintenant, et contactez dès que possible une structure d’aide pour vous mettre à l’abri.',
  },
}
