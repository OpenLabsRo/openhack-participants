import { rest } from 'msw'
import { resolveApiBase } from '../../../src/lib/apiBase'

const BASE = resolveApiBase()

export const handlers = [
  rest.post(`${BASE}/accounts/check`, (_req, res, ctx) => {
    return res(ctx.json({ registered: false }))
  }),

  rest.post(`${BASE}/accounts/register`, (_req, res, ctx) => {
    return res(
      ctx.json({
        token: 'tok',
        account: {
          id: '1',
          email: 'a@b.com',
          password: '',
          name: 'A',
          teamID: '',
        },
      })
    )
  }),

  rest.post(`${BASE}/accounts/login`, (_req, res, ctx) => {
    return res(
      ctx.json({
        token: 'tok2',
        account: {
          id: '2',
          email: 'b@b.com',
          password: '',
          name: 'B',
          teamID: '',
        },
      })
    )
  }),

  rest.get(`${BASE}/accounts/flags`, (_req, res, ctx) => {
    return res(
      ctx.json({
        flags: { feature: true },
        stage: { name: 'open' },
      })
    )
  }),

  rest.patch(`${BASE}/teams/submissions/desc`, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ok: true }))
  }),

  rest.get(`${BASE}/teams`, (_req, res, ctx) => {
    return res(
      ctx.json({
        id: 't1',
        name: 'Team',
        members: [],
        submission: { desc: 'latest' },
      })
    )
  }),
]
