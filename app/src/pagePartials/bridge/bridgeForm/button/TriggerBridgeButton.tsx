import React, { useState } from 'react'
import { BigNumber } from 'ethers'
import { useRouter } from 'next/router'
import useTransaction from '@/src/hooks/useTransaction'
import { useBridgeTransactionInfo } from '@/src/hooks/bridge/useBridgeTransactionInfo'
import { getBridgeCommonInfo } from '@/src/hooks/bridge/utils/getBridgeCommonInfo'
import { bridgePagesBaseURL } from '@/src/constants/sections'
import { ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { Button } from './Button'
import { ButtonPlaceholderWithWarning } from './ButtonPlaceholderWithWarning'
import { isSameString } from '@/src/utils/tools'
import { USDC_ETHEREUM } from '@/src/constants/misc'

interface TriggerBridgeButtonProps {
  userAddress: string
  fromChainId: ChainsValues
  toChainId: ChainsValues
  token: Token
  amount: BigNumber
  recipient: string
  receiveNativeToken: boolean
  toToken?: Token
}

export const TriggerBridgeButton: React.FC<TriggerBridgeButtonProps> = ({
  amount,
  fromChainId,
  receiveNativeToken,
  recipient,
  toChainId,
  toToken,
  token,
  userAddress,
}) => {
  const [isSending, setIsSending] = useState(false)
  const sendTx = useTransaction()
  const router = useRouter()

  const { data: transactionData } = useBridgeTransactionInfo({
    receiveNativeToken,
    userAddress,
    fromChainId,
    toChainId,
    amount,
    recipient,
    token,
    toToken,
  })

  if (!transactionData) throw new Error('Transaction data is not available')

  const { isNativeBridge } = getBridgeCommonInfo({
    fromChainId,
    toChainId,
    tokenAddress: token.address,
  })

  const handleBridgeTx = async () => {
    setIsSending(true)

    if (!transactionData.tx) {
      console.error('No transactionData.tx')
      return
    }

    try {
      const tx = await sendTx(transactionData.tx)
      if (tx) {
        router.push(
          `${bridgePagesBaseURL}/${tx.hash}?fromChainId=${fromChainId}&isNativeBridge=${
            isNativeBridge ? 1 : 0
          }&tokenAddress=${token.address}&amount=${amount}&toChainId=${toChainId}`,
        )
      } else {
        throw new Error('Failed to bridge')
      }
    } catch (error) {
      console.error(error)
      setIsSending(false)
    }
  }

  if (isSending) {
    return <ButtonPlaceholderWithWarning action="bridging" />
  }

  const isUsdcEth = isSameString(token.address, USDC_ETHEREUM)

  return (
    <>
      <Button onClick={handleBridgeTx}>Bridge</Button>
      {isUsdcEth && (
        <div
          style={{
            fontSize: '1.4rem',
            fontWeight: 400,
            lineHeight: '1.2',
            margin: 0,
            textAlign: 'center',
            color: 'rgb(221, 113, 67)',
          }}
        >
          When bridging USDC from Ethereum the receiver is the <b>USDC.e swapping contract</b>,
          after bridging it sends funds to your recipient address
          <br />
          You can track this transaction by its hash or by the sender address on the{' '}
          <a href={`/bridge-explorer?hash=${userAddress}`} rel="noreferrer" target="_blank">
            Search page
          </a>
        </div>
      )}
    </>
  )
}
