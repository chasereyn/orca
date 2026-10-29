import { describe, expect, it } from 'vitest'
import { customPanelTabKey, isCustomPanelTabKey, resolveCustomPanels } from './custom-panels'

describe('custom panels', () => {
  it('round-trips tab keys', () => {
    expect(isCustomPanelTabKey(customPanelTabKey('prs'))).toBe(true)
    expect(isCustomPanelTabKey('custom-panel:')).toBe(false)
    expect(isCustomPanelTabKey('explorer')).toBe(false)
  })

  it('defaults to no panels', () => {
    expect(resolveCustomPanels({})).toEqual([])
    expect(resolveCustomPanels(null)).toEqual([])
  })

  it('drops panels without a URL', () => {
    const docs = {
      id: 'a',
      title: 'Docs',
      url: 'http://localhost:3000/',
      icon: 'globe' as const
    }
    expect(resolveCustomPanels({ customPanels: [docs, { ...docs, id: 'b', url: ' ' }] })).toEqual([
      docs
    ])
  })
})
