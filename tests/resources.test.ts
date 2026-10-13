import { describe, expect, it } from 'vitest'

import { CITIES, DIRECTORY, detectCity, EMERGENCY_NUMBERS, findResources, mapUrl } from '@/lib/elle/resources'

describe('annuaire', () => {
  it('couvre les six villes du programme', () => {
    for (const city of CITIES) {
      expect(findResources({ city: city.id }).some((resource) => resource.city === city.id)).toBe(true)
    }
  })

  it('a des identifiants uniques', () => {
    const ids = DIRECTORY.map((resource) => resource.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('inclut toujours les numéros nationaux', () => {
    const resources = findResources({ city: 'garoua', categories: ['sante'] })
    expect(resources.some((resource) => resource.city === null)).toBe(false)
    const withUrgence = findResources({ city: 'garoua', categories: ['urgence', 'sante'] })
    expect(withUrgence.filter((resource) => resource.city === null)).toHaveLength(EMERGENCY_NUMBERS.length)
  })

  it('ne mélange pas les villes', () => {
    const resources = findResources({ city: 'douala' })
    expect(resources.every((resource) => resource.city === null || resource.city === 'douala')).toBe(true)
  })

  it('ne marque aucune fiche comme vérifiée sans contrôle humain', () => {
    // Ce test échoue volontairement le jour où une fiche passe à verified: true :
    // il rappelle de documenter la vérification dans docs/ANNUAIRE.md avant de l'adapter.
    expect(DIRECTORY.every((resource) => resource.verified === false)).toBe(true)
  })

  it('construit des liens Google Maps encodés', () => {
    const resource = findResources({ city: 'yaounde', categories: ['sante'] })[0]
    expect(mapUrl(resource)).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=H%C3%B4pital/)
  })
})

describe('detectCity', () => {
  it.each([
    ['J’habite à Yaoundé, quartier Bastos', 'yaounde'],
    ['je suis a douala', 'douala'],
    ['I live in Buea', 'buea'],
    ['Maroua', 'maroua'],
  ])('%s → %s', (text, city) => {
    expect(detectCity(text)).toBe(city)
  })

  it('renvoie null sans ville connue', () => {
    expect(detectCity('Je vis à Ebolowa')).toBeNull()
  })
})
