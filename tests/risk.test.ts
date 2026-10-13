import { describe, expect, it } from 'vitest'

import { assessConversation, assessRisk } from '@/lib/elle/risk'

describe('assessRisk', () => {
  it.each([
    ['Il m’a dit qu’il va me tuer ce soir', 'threat-to-kill'],
    ['He go kill me if I talk', 'threat-to-kill'],
    ['Il a pris la machette et m’a menacée', 'weapon'],
    ['Hier il a essayé de m’étrangler', 'strangulation'],
    ['Il est là, devant la porte', 'aggressor-present'],
    ['Il m’a enfermée dans la chambre', 'aggressor-present'],
  ])('détecte un danger immédiat : %s', (text, signal) => {
    const result = assessRisk(text)
    expect(result.level).toBe('immediate')
    expect(result.signals.map((s) => s.id)).toContain(signal)
  })

  it('repère les idées suicidaires comme danger immédiat', () => {
    const result = assessRisk('Je n’en peux plus, je veux mourir')
    expect(result.level).toBe('immediate')
    expect(result.selfHarm).toBe(true)
  })

  it.each([
    ['Mon mari me frappe tous les soirs'],
    ['Il m’a giflée devant les enfants'],
    ['My husband beats me'],
    ['J’ai été violée par mon oncle'],
    ['Mes parents veulent me marier de force'],
    ['J’ai 15 ans et mon beau-père me touche'],
  ])('classe en danger élevé : %s', (text) => {
    expect(assessRisk(text).level).toBe('high')
  })

  it.each([
    ['Il contrôle mon téléphone et m’interdit de sortir'],
    ['Il m’insulte et me rabaisse tout le temps'],
    ['J’ai peur de rentrer chez moi'],
    ['Je subis des violences à la maison'],
  ])('signale une inquiétude : %s', (text) => {
    expect(assessRisk(text).level).toBe('concern')
  })

  it.each([['Bonjour'], ['Comment porter plainte ?'], ['Il m’a passé un coup de fil hier'], ['J’aime la couleur violette']])(
    'ne déclenche rien sur un message neutre : %s',
    (text) => {
      expect(assessRisk(text).level).toBe('none')
    },
  )

  it('ignore accents et majuscules', () => {
    expect(assessRisk('IL VA ME TUER').level).toBe('immediate')
    expect(assessRisk('il ma etranglee').level).toBe('immediate')
  })
})

describe('assessConversation', () => {
  it('garde le niveau le plus grave de toute la conversation', () => {
    const result = assessConversation(['Il a menacé de me tuer', 'Merci, comment porter plainte ?'])
    expect(result.level).toBe('immediate')
  })

  it('renvoie none pour une conversation vide', () => {
    expect(assessConversation([]).level).toBe('none')
  })
})
