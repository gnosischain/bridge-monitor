import { useState } from 'react'
import { Button } from './Button'
import { BridgeWithSteps } from '../bridgeWithSteps'
import { Token } from '@/types/token'

interface Props {
  amount: bigint
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
