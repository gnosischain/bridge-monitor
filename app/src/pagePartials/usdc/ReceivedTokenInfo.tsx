import { ChainsValues } from '@/src/constants/config/types'
import { NoTokenOut, TokenOut } from '@/src/pagePartials/bridge/bridgeForm/TokenOut'
import { Token } from '@/types/token'
import { BigNumber } from 'ethers'
import { genericSuspense } from '@/src/components/safeSuspense'

export const ReceivedTokenInfo: React.FC<{
  fromChainId: ChainsValues
  toChainId: ChainsValues
  setReceiveNativeToken: (receiveNative: boolean) => void
  token: Token | undefined
  amountBN: BigNumber
  tokenOut?: Token
}> = genericSuspense(
  ({ amountBN, fromChainId, setReceiveNativeToken, toChainId, token, tokenOut }) => {
    return (
      <>
        {!token || !tokenOut ? (
          <NoTokenOut />
        ) : (
          <TokenOut
            amount={amountBN}
            fromChainId={fromChainId}
            setReceiveNativeToken={setReceiveNativeToken}
            toChainId={toChainId}
            token={token}
            tokenOut={tokenOut}
          />
        )}
      </>
    )
  },
  () => <NoTokenOut loading />,
)
