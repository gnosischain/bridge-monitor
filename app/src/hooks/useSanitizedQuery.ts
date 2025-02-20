import { Token, TokensByNetwork } from '@/types/token'
import { ParsedUrlQuery } from 'querystring'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { isSameString } from '@/src/utils/tools'
import { usdcTokens } from '@/src/constants/usdcTokens'
import { useMemo } from 'react'
import { useRouter } from 'next/router'

const tokensException: TokensByNetwork = {
  '100': [usdcTokens.usdceGnosis],
}

type SanitizedQuery = {
  amount: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token | undefined
}

const sanitizeQuery = (query: ParsedUrlQuery, tokensByNetwork: TokensByNetwork): SanitizedQuery => {
  const sanitizedAmount =
    query.amount && !isNaN(Number(query.amount)) ? query.amount.toString() : ''

  const validFromChainId = (Object.values(Chains) as number[]).includes(Number(query.fromChainId))
    ? (Number(query.fromChainId) as ChainsValues)
    : Chains.mainnet

  const validToChainId = validFromChainId === Chains.mainnet ? Chains.gnosis : Chains.mainnet

  const validToken = tokensByNetwork[validFromChainId]?.find((t) =>
    isSameString(t.address, query.token as string),
  )

  return {
    amount: sanitizedAmount,
    fromChainId: validFromChainId,
    toChainId: validToChainId,
    token: validToken,
  }
}

export const useSanitizedQuery = (tokensByNetwork: TokensByNetwork) => {
  const router = useRouter()
  return useMemo(
    () => sanitizeQuery(router.query, { ...tokensByNetwork, ...tokensException }),
    [router.query, tokensByNetwork],
  )
}
