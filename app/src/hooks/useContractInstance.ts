import { JsonRpcProvider } from '@ethersproject/providers'
import nullthrows from 'nullthrows'

import { ChainsValues } from '../constants/config/types'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { ContractsKeys, contracts } from '@/src/constants/config/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import * as typechainImports from '@/types/typechain'
import { ObjectValues } from '@/types/utils'

type GetFactories<T> = T extends { connect: (...args: any) => any } ? T : never

type AppFactories = GetFactories<ObjectValues<typeof typechainImports>>

export const useContractInstance = <F extends AppFactories, RT extends ReturnType<F['connect']>>(
  contractFactory: F,
  contractKey: ContractsKeys,
  chainId?: ChainsValues,
) => {
  const { appChainId, web3Provider } = useWeb3Connection()
  const currentChainId = chainId ?? appChainId
  const address = contracts[contractKey]['address'][currentChainId]

  // If `chainId` is specified, we use a read-only provider
  if (chainId) {
    const readOnlyProvider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)
    return contractFactory.connect(address, readOnlyProvider) as RT
  }

  const signer = nullthrows(web3Provider?.getSigner(), 'There is not signer to execute a tx.')
  return contractFactory.connect(address, signer) as RT
}
