import { useState } from 'react'
import { Button } from './Button'
import { BridgeWithSteps } from '../bridgeWithSteps/BridgeWithSteps'
import { BigNumber } from 'ethers'
import { Token } from '@/types/token'

interface Props {
  amount: BigNumber
  recipient: string
  userAddress: string
  tokenIn?: Token
  tokenOut?: Token
}

export const SwapAndBridge: React.FC<Props> = ({
  amount,
  recipient,
  tokenIn,
  tokenOut,
  userAddress,
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false)

  console.log(amount, recipient, tokenIn, tokenOut, userAddress)

  return (
    <>
      <Button onClick={() => setIsOpened(true)}>Swap & Bridge</Button>
      {isOpened && tokenIn && tokenOut && (
        <BridgeWithSteps
          amount={amount}
          onClose={() => {
            setIsOpened(false)
          }}
          recipient={recipient}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          userAddress={userAddress}
        />
      )}
    </>
  )
}
