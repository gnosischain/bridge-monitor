import { ChainsValues } from '@/src/constants/config/types'
import { NoTokenOut, TokenOut } from '@/src/pagePartials/bridge/bridgeForm/TokenOut'
import { Token } from '@/types/token'
import { genericSuspense } from '@/src/components/safeSuspense'

export const ReceivedTokenInfo: React.FC<{
  fromChainId: ChainsValues
  toChainId: ChainsValues
  setReceiveNativeToken: (receiveNative: boolean) => void
  setReceiveUsds: (receiveUsds: boolean) => void
  token: Token | undefined
  amount: bigint
  tokenOut?: Token
}> = genericSuspense(
  ({ amount, fromChainId, setReceiveNativeToken, setReceiveUsds, toChainId, token, tokenOut }) => {
    return (
      <>
        {!token ? (
          <NoTokenOut />
        ) : !tokenOut ? (
          <NoTokenOut loading />
        ) : (
          <TokenOut
            amount={amount}
            fromChainId={fromChainId}
            setReceiveNativeToken={setReceiveNativeToken}
            setReceiveUsds={setReceiveUsds}
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
