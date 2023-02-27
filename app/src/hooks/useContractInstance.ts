import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
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
  const { appChainId, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const currentChainId = chainId ?? appChainId
  const address = contracts[contractKey]['address'][currentChainId]
  const readOnlyProvider = chainId
    ? new JsonRpcProvider(getNetworkConfig(currentChainId)?.rpcUrl, currentChainId)
    : readOnlyAppProvider
  const signer = web3Provider?.getSigner() || readOnlyProvider
  nullthrows(signer, 'There is not signer to execute a tx.')

  return contractFactory.connect(address, signer as JsonRpcSigner | JsonRpcProvider) as RT
}
