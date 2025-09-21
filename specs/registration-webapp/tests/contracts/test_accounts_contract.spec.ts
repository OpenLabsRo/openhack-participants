import { describe, it, expect } from 'vitest'
import { loadContractYaml } from './helpers'

describe('Accounts contract (spec-only)', () => {
  it('loads accounts contract and contains /accounts paths', () => {
    const c = loadContractYaml('../../contracts/accounts.yaml')
    expect(c.paths).toBeDefined()
    expect(c.paths['/accounts/check']).toBeDefined()
    expect(c.paths['/accounts/register']).toBeDefined()
    expect(c.paths['/accounts/login']).toBeDefined()
  })
})
