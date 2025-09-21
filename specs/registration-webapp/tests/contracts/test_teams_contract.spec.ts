import { describe, it, expect } from 'vitest'
import { loadContractYaml } from './helpers'

describe('Teams contract (spec-only)', () => {
  it('loads teams contract and contains /teams paths', () => {
    const c = loadContractYaml('../../contracts/teams.yaml')
    expect(c.paths).toBeDefined()
    expect(c.paths['/teams']).toBeDefined()
    expect(c.paths['/teams/submissions/desc']).toBeDefined()
  })
})
