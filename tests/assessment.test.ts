import { describe, expect, it } from 'vitest'

import { DANGER_QUESTIONS, scoreDanger } from '@/lib/elle/assessment'

const yes = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, true]))

describe('scoreDanger', () => {
  it('aucune réponse positive → faible', () => {
    expect(scoreDanger({}).level).toBe('low')
  })

  it('un facteur mineur → modéré', () => {
    expect(scoreDanger(yes('control')).level).toBe('moderate')
  })

  it('un seul facteur critique suffit pour un danger élevé', () => {
    expect(scoreDanger(yes('strangulation')).level).toBe('high')
  })

  it('deux facteurs critiques → très élevé', () => {
    expect(scoreDanger(yes('death-threat', 'weapon')).level).toBe('severe')
  })

  it('tout oui → très élevé, score maximal', () => {
    const result = scoreDanger(yes(...DANGER_QUESTIONS.map((question) => question.id)))
    expect(result.level).toBe('severe')
    expect(result.score).toBe(result.maxScore)
  })

  it('les réponses « non » ne comptent pas', () => {
    expect(scoreDanger({ 'death-threat': false, weapon: false }).level).toBe('low')
  })
})
