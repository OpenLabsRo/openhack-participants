import { describe, it, expect } from 'vitest'
import {
  compileSchemaFor,
  validateWithCompiled,
  candidateContractPaths,
} from './integration/contractValidator'

describe('contractValidator', () => {
  it('finds candidate contract paths (sanity)', () => {
    const candidates = candidateContractPaths('accounts.yaml')
    expect(Array.isArray(candidates)).toBe(true)
    expect(candidates.length).toBeGreaterThan(0)
  })

  it('compiles /accounts/register response schema and validates a good payload', () => {
    const validator = compileSchemaFor(
      '/accounts/register',
      'post',
      '200'
    )
    expect(validator).toBeTruthy()
    const goodBody = {
      token: 'abc',
      account: { id: '1', email: 'a@b.com' },
    }
    const res = validateWithCompiled(validator, goodBody)
    expect(res.valid).toBe(true)
    expect(res.errors).toBeNull()
  })

  it('reports invalid payloads for /accounts/register', () => {
    const validator = compileSchemaFor(
      '/accounts/register',
      'post',
      '200'
    )
    expect(validator).toBeTruthy()
    const badBody = { token: 123, account: { id: 1, email: null } }
    const res = validateWithCompiled(validator, badBody)
    expect(res.valid).toBe(false)
    expect(Array.isArray(res.errors)).toBe(true)
  })
})
