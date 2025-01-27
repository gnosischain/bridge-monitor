import useSWR from 'swr'
import { Bridges, BridgesValues } from '../constants/config/bridges'
import { contracts } from '../constants/config/contracts'
import { Chains } from '../constants/config/types'
import { Validator } from '../utils/validators'

type ValidatorWithId = Validator & {
  id: number
}

const REFRESH_INTERVAL = 120000 // 2 minutes in milliseconds
// const LAST_SEEN_URL = 'https://hashi-explorer.xyz/api_bridge_ui/lastseen'
// const SIGNED_URL =
//   'https://hashi-explorer.xyz/api_bridge_ui/num_hashi_signed?days_elapsed=1&address=0x2F62433e00168af10c70bc39e2fDbEe5DaCA257b'

const AMB_ADDRESS = contracts.AMB.address[Chains.mainnet]
const XDAI_ADDRESS = contracts.XDAIBridge.address[Chains.mainnet]

export function useHashi() {
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    const data = await res.json()
    return data
  }

  const { data: seenData, error: seenError } = useSWR('/api/lastseen', fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  })

  const { data: signedDataAmb1, error: signedErrorAmb1 } = useSWR(
    `/api/num_hashi_signed?days_elapsed=1&address=${AMB_ADDRESS}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    },
  )
  const { data: signedDataAmb7 } = useSWR(
    `/api/num_hashi_signed?days_elapsed=7&address=${AMB_ADDRESS}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    },
  )

  const { data: signedDataXdai1, error: signedErrorXdai1 } = useSWR(
    `/api/num_hashi_signed?days_elapsed=1&address=${XDAI_ADDRESS}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    },
  )
  const { data: signedDataXdai7 } = useSWR(
    `/api/num_hashi_signed?days_elapsed=7&address=${XDAI_ADDRESS}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
    },
  )

  const getHashiSignedTransactions = (afterDate: number, bridge: BridgesValues) => {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const twoDaysInSeconds = 24 * 60 * 60 * 2
    const days1or7 = currentTimestamp - afterDate <= twoDaysInSeconds ? 1 : 7

    if (days1or7 === 1) {
      return bridge === Bridges.amb
        ? signedDataAmb1.num_hashi_signed
        : signedDataXdai1.num_hashi_signed
    } else {
      return bridge === Bridges.amb
        ? signedDataAmb7.num_hashi_signed
        : signedDataXdai7.num_hashi_signed
    }
  }

  const hashiAmb = {
    id: 10,
    name: 'Hashi',
    address: '', // N/A for Hashi
    bridgeType: Bridges.amb,
    lastSeen: seenError ? undefined : new Date(seenData.lastseen).getTime(),
    signed: signedErrorAmb1 ? undefined : signedDataAmb1.num_hashi_signed,
    executed: undefined, // N/A for Hashi
    shortName: 'H',
    status: 'default',
  } as ValidatorWithId

  const hashiXdai = {
    id: 10,
    name: 'Hashi',
    address: '', // N/A for Hashi
    bridgeType: Bridges.xdai,
    lastSeen: seenError ? undefined : new Date(seenData.lastseen).getTime(),
    signed: signedErrorXdai1 ? undefined : signedDataXdai1.num_hashi_signed,
    executed: undefined, // N/A for Hashi
    shortName: 'H',
    status: 'default',
  } as ValidatorWithId

  return {
    hashiAmb,
    hashiXdai,
    getHashiSignedTransactions,
  }
}
