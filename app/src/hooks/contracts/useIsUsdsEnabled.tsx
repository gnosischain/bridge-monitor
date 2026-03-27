import { foreignXdaiBridgeContract } from '@/src/constants/config/contracts'
import { USDS_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import { useReadContract } from 'wagmi'

export const useIsUsdsEnabled = () => {
  const { data: erc20Address } = useReadContract({
    ...foreignXdaiBridgeContract,
    functionName: 'erc20token',
  })

  return isSameString(erc20Address, USDS_ADDRESS)
}
