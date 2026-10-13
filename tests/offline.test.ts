import { describe, expect, it } from 'vitest'

import { offlineReply } from '@/lib/elle/offline'

describe('offlineReply', () => {
  it('donne les urgences en premier quand la vie est menacée', () => {
    const reply = offlineReply(['Il a un couteau et il va me tuer'])
    expect(reply.text).toContain('117')
    expect(reply.text.indexOf('117')).toBeLessThan(400)
    expect(reply.resources.some((resource) => resource.phone === '117')).toBe(true)
  })

  it('accueille sans alarmer sur un simple bonjour', () => {
    const reply = offlineReply(['Bonjour'])
    expect(reply.text).toContain('Elle')
    expect(reply.resources).toHaveLength(0)
  })

  it('explique comment porter plainte', () => {
    const reply = offlineReply(['Comment porter plainte ?'])
    expect(reply.text).toMatch(/Procureur/)
  })

  it('demande la ville quand elle est inconnue, propose des lieux quand elle est connue', () => {
    expect(offlineReply(['Mon mari me frappe']).text).toMatch(/Dans quelle ville/)
    const reply = offlineReply(['Mon mari me frappe, je suis à Bamenda'])
    expect(reply.text).not.toMatch(/Dans quelle ville/)
    expect(reply.resources.some((resource) => resource.city === 'bamenda')).toBe(true)
  })

  it('oriente vers les urgences en cas d’idées suicidaires', () => {
    const reply = offlineReply(['Je veux en finir'])
    expect(reply.text).toMatch(/117/)
    expect(reply.text).not.toMatch(/Dans quelle ville/)
  })
})
