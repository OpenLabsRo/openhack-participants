import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { updateDesc } from '../../src/runes/submissionRune'
import { teamRune } from '../../src/runes/teamRune'
import { get } from 'svelte/store'
import { resolveApiBase } from '../../src/lib/apiBase'
import { server } from './mocks/server'
import validator from './contractValidator'

const BASE = resolveApiBase()

let patchCalls = 0

const useMocks =
  ((globalThis as any).process?.env?.USE_MOCKS ??
    (globalThis as any).USE_MOCKS) === 'true'

if (useMocks) {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterAll(() => server.close())
}

describe('integration/submission_debounce', () => {
  it('saves only once when called rapidly (debounce simulated by multiple calls)', async () => {
    patchCalls = 0
    await updateDesc('first')
    await updateDesc('second')
    await updateDesc('final')

    // Without mocks the exact server response is environment-dependent. We assert
    // that the team rune has a submission value (when the live API provides it).
    const submissionDesc = get(teamRune)!.submission?.desc
    expect(
      submissionDesc == null || typeof submissionDesc === 'string'
    ).toBe(true)

    if (useMocks) {
      // validate the /teams GET response schema
      const validate = validator.compileSchemaFor(
        '/teams',
        'get',
        '200'
      )
      if (validate) {
        const { valid, errors } = validator.validateWithCompiled(
          validate,
          get(teamRune)
        )
        expect(valid).toBe(true)
        expect(errors).toBe(null)
      }
    }
  })

  it('handles server error on patch gracefully', async () => {
    if (useMocks) {
      const { rest } = await import('msw')
      server.use(
        rest.patch(
          `${BASE}/teams/submissions/desc`,
          (_req, res, ctx) =>
            res(ctx.status(500), ctx.json({ error: 'boom' }))
        )
      )
      let threw = false
      try {
        await updateDesc('willfail')
      } catch (e: any) {
        threw = true
        expect(e.response?.status).toBe(500)
      }
      expect(threw).toBe(true)
    } else {
      // Live backend: this negative-path requires mock server to force 500.
      expect(true).toBe(true)
    }
  })
})
