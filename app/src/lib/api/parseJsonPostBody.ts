import type { NextApiRequest, NextApiResponse } from 'next'

const errorBody = (message: string) => ({ errors: [{ message }] })

export type ParsedJsonPostBody = { ok: true; body: unknown } | { ok: false }

/**
 * Shared POST-only guard + JSON body parsing for the app's non-proxy API routes (`/api/user/*`,
 * `/api/bridge/*`). On failure it writes the response itself — 405 with an `Allow` header, or
 * 400 on unparsable JSON, both using the `{ errors: [{ message }] }` envelope every route uses
 * — and returns `{ ok: false }`; callers should return immediately in that case.
 */
export function parseJsonPostBody(req: NextApiRequest, res: NextApiResponse): ParsedJsonPostBody {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json(errorBody('Method not allowed'))
    return { ok: false }
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      res.status(400).json(errorBody('Invalid JSON body'))
      return { ok: false }
    }
  }

  return { ok: true, body }
}
