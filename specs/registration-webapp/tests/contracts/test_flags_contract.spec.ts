import { describe, it, expect } from 'vitest'
import { loadContractYaml } from './helpers'

describe('Flags contract (spec-only)', () => {
  it('loads flags contract and contains /accounts/flags path', () => {
    const c = loadContractYaml('../../contracts/flags.yaml')
    expect(c.paths).toBeDefined()
    expect(c.paths['/accounts/flags']).toBeDefined()
  })
})
