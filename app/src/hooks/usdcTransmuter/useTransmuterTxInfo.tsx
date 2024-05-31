import { BigNumber, Signer, ethers } from 'ethers'
import { Chains } from '@/src/constants/config/types'
import useSWR from 'swr'
import { USDC_XDAI_OLD, ZERO_BN } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TRANSMUTER_ADDRESS } from '@/src/pagePartials/usdc/const'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'
import TransmuterAbi from '@/src/abis/TransmuterEurc.json'

export const getTransTx = async ({
  account,
  amount,
  signer,
  tokenAddress,
}: {
  account: string
  amount: BigNumber
  signer: Signer
  tokenAddress: string
}) => {
  const transmuteContract = new ethers.Contract(TRANSMUTER_ADDRESS, TransmuterAbi, signer)
  const transMethod = tokenAddress === USDC_XDAI_OLD ? 'deposit' : 'withdraw'

  if (amount.lte(0) || !account) {
    return {
      gasLimit: ZERO_BN,
      gasPrice: ZERO_BN,
      tx: null,
    }
  }

  const gasPrice = await transmuteContract.provider.getGasPrice()
  try {
    const gasLimit = await transmuteContract.estimateGas[transMethod](amount)

    return {
      gasLimit,
      gasPrice,
      tx: async function () {
        return transmuteContract[transMethod](amount, {
          gasLimit: gasLimit,
        })
      },
    }
  } catch (error) {
    console.error('Error getting transmuter transaction info', error)
    return {
      gasLimit: ZERO_BN,
      gasPrice: ZERO_BN,
      tx: null,
    }
  }
}

export const useTransmuterTxInfo = ({
  amount,
  token,
  userAddress,
}: {
  amount: BigNumber
  token: TokenUsdc
  userAddress: string
}) => {
  const { walletChainId, web3Provider } = useWeb3Connection()
  if (!web3Provider) throw new Error('No web3 provider available')
  const signer = web3Provider.getSigner()
  if (walletChainId !== Chains.gnosis) throw new Error('Invalid chain')

  const { data: transactionData } = useSWR(
    ['transactionInfo', token, amount, userAddress],
    async ([, _token, _amount, _userAddress]) => {
      const { gasLimit, gasPrice, tx } = await getTransTx({
        account: _userAddress,
        amount: _amount,
        signer,
        tokenAddress: _token.address,
      })

      return {
        gasLimit,
        gasPrice,
        tx,
      }
    },
  )

  return transactionData
}
