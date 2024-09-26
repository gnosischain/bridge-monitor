import useSWR from 'swr'
import { type BalanceItem, type ChainID, CovalentClient } from '@covalenthq/client-sdk'
import { BigNumber } from 'ethers'

const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY || ''

export const useUserTokenListBalances = ({
  chainId,
  userAddress,
}: {
  userAddress: string | null
  chainId: number
}) => {
  return useSWR(userAddress ? ['tokenUserBalances', userAddress, chainId] : null, async () => {
    try {
      if (!userAddress || !COVALENT_API_KEY) return {} as Record<string, BigNumber>

      const client = new CovalentClient(COVALENT_API_KEY)
      const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
        chainId as ChainID,
        userAddress,
      )

      if (resp.error) {
        console.log(resp.error_message)
        throw new Error(resp.error_message)
      }

      const balances = resp.data.items.reduce<Record<string, BigNumber>>(
        (acc, item: BalanceItem) => {
          const balance = BigNumber.from(item.balance)
          if (balance.eq(0)) return acc
          acc[item.contract_address] = BigNumber.from(item.balance)
          return acc
        },
        {},
      )

      return balances
    } catch (error) {
      console.log('Error fetching user tokens balances', error)
      console.log('Params with error', {
        chainId,
        userAddress,
      })
      return {} as Record<string, BigNumber>
    }
  })
}
