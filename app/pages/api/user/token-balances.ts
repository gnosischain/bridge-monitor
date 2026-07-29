import type { NextApiRequest, NextApiResponse } from 'next'
import { type Address, erc20Abi, isAddress } from 'viem'

import { parseJsonPostBody } from '@/src/lib/api/parseJsonPostBody'
import { getServerClient, isSupportedServerChain } from '@/src/lib/server/rpc'

/**
 * A user's ERC-20 balances for a specific set of tokens, read server-side by batching
 * `balanceOf(address)` into a single Multicall3 call.
 *
 * The caller passes the token list because the app already knows exactly which tokens it
 * cares about (the curated bridge list) — so no provider-specific "discover all tokens"
 * method is needed, and this runs on any standard RPC (Tenderly / the Gnosis public node).
 * Per-user and block-sensitive, so not cached; only non-zero balances are returned.
 * `balanceOf` reads are benign, so an arbitrary token list is safe; the list is capped only
 * to bound the multicall size. The curated bridge list is ~45 tokens per chain, and viem packs
 * ~28 `balanceOf` reads into each Multicall3 `aggregate3` eth_call (1024-byte batch ÷ 36 bytes),
 * so 60 keeps a request to at most 3 upstream calls while never truncating real usage.
 */
const MAX_TOKENS = 60

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Per-user, block-sensitive data — never cacheable, on any response path (incl. errors).
  res.setHeader('Cache-Control', 'no-store')

  const parsed = parseJsonPostBody(req, res)
  if (!parsed.ok) return

  const { address, chainId, tokens } = (parsed.body ?? {}) as {
    address?: string
    chainId?: number
    tokens?: string[]
  }
  const chain = Number(chainId)

  if (!isSupportedServerChain(chain)) {
    return res.status(400).json({ errors: [{ message: 'Unsupported chainId' }] })
  }
  if (typeof address !== 'string' || !isAddress(address)) {
    return res.status(400).json({ errors: [{ message: 'Invalid address' }] })
  }
  if (!Array.isArray(tokens)) {
    return res.status(400).json({ errors: [{ message: 'tokens must be an array' }] })
  }

  const tokenAddresses = tokens
    .filter((token): token is Address => isAddress(token))
    .slice(0, MAX_TOKENS)

  if (tokenAddresses.length === 0) {
    return res.status(200).json({ balances: {} })
  }

  // A missing upstream is a server misconfiguration (500), distinct from an upstream that is
  // configured but fails to respond (502 below) — so resolve the client outside the RPC try.
  let client
  try {
    client = getServerClient(chain)
  } catch (error) {
    console.error('[api/user/token-balances] no RPC upstream configured', { chain, error })
    return res.status(500).json({ errors: [{ message: 'Server misconfiguration' }] })
  }

  try {
    const results = await client.multicall({
      allowFailure: true,
      contracts: tokenAddresses.map((token) => ({
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf' as const,
        args: [address] as const,
      })),
    })

    // bigint isn't JSON-serialisable → return non-zero balances as decimal strings.
    const balances: Record<string, string> = {}
    results.forEach((result, i) => {
      if (result.status === 'success' && result.result > 0n) {
        balances[tokenAddresses[i]] = result.result.toString()
      }
    })

    return res.status(200).json({ balances })
  } catch (error) {
    console.error('[api/user/token-balances] upstream RPC request failed', { chain, error })
    return res.status(502).json({ errors: [{ message: 'Upstream RPC request failed' }] })
  }
}
