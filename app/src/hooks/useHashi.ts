import useSWR from 'swr'
import { Bridges } from '../constants/config/bridges'
import { contracts } from '../constants/config/contracts'
import { Chains } from '../constants/config/types'

const REFRESH_INTERVAL = 120000 // 2 minutes in milliseconds
// const LAST_SEEN_URL = 'https://hashi-explorer.xyz/api_bridge_ui/lastseen'
// const SIGNED_URL =
//   'https://hashi-explorer.xyz/api_bridge_ui/num_hashi_signed?days_elapsed=1&address=0x2F62433e00168af10c70bc39e2fDbEe5DaCA257b'

const API_INFO_ADDRESS = contracts.AMB.address[Chains.mainnet]

export function useHashi() {
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    const data = await res.json()
    return data
  }

  const { data: seenData, error: seenError } = useSWR('/api/lastseen', fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  })

  const { data: signedData1, error: signedError1 } = useSWR(
    `/api/num_hashi_signed?days_elapsed=1&address=${API_INFO_ADDRESS}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    },
  )

  const { data: signedData7 } = useSWR(
    `/api/num_hashi_signed?days_elapsed=7&address=${API_INFO_ADDRESS}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    },
  )

  const getHashiSignedTransactions = (afterDate: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const twoDaysInSeconds = 24 * 60 * 60 * 2
    const days1or7 = currentTimestamp - afterDate <= twoDaysInSeconds ? 1 : 7

    if (days1or7 === 1) {
      return signedData1.num_hashi_signed
    } else {
      return signedData7.num_hashi_signed
    }
  }

  const hashi = {
    id: 10,
    name: 'Hashi',
    address: '', // N/A for Hashi
    bridgeType: Bridges.amb,
    lastSeen: seenError ? undefined : new Date(seenData.lastseen).getTime(),
    signed: signedError1 ? undefined : signedData1.num_hashi_signed,
    executed: undefined, // N/A for Hashi
    shortName: 'H',
    status: 'default',
  }

  return {
    hashi,
    getHashiSignedTransactions,
  }
}
