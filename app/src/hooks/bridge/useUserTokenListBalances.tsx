import useSWR from 'swr'

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''

const apiUrl: Record<string, string> = {
  '1': `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  '100': `https://gnosis-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
}

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

export const useUserTokenListBalances = ({
  chainId,
  userAddress,
}: {
  userAddress: string | null
  chainId: number
}) => {
  return useSWR(userAddress ? ['tokenUserBalances', userAddress, chainId] : null, async () => {
    try {
      if (!userAddress || !ALCHEMY_API_KEY) return {} as Record<string, bigint>

      const body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [userAddress, 'erc20'],
        id: 1,
      })

      const response = await fetch(apiUrl[String(chainId)], {
        method: 'POST',
        headers,
        body,
      })

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.error('Alchemy API error:', data.error.message)
        throw new Error(data.error.message)
      }

      const tokenBalances = data.result.tokenBalances
      const balances: Record<string, bigint> = {}

      tokenBalances.forEach((token: { contractAddress: string; tokenBalance: string }) => {
        const balance = BigInt(token.tokenBalance)
        if (balance !== 0n) {
          balances[token.contractAddress] = balance
        }
      })

      return balances
    } catch (error) {
      console.log('Error fetching user tokens balances', error)
      console.log('Params with error', {
        chainId,
        userAddress,
      })
      return {} as Record<string, bigint>
    }
  })
}
