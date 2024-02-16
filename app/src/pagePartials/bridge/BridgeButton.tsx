import styled from 'styled-components'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Connect } from '@/src/components/assets/Connect'
import { ChainsValues } from '@/src/constants/config/types'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'

const Button = styled(ButtonFull)`
  margin: 0 auto;
  width: 100%;
`

export const ButtonPlaceholder: React.FC = () => <Button disabled>Loading...</Button>

type BridgeButtonProps = {
  approvalTx?: () => void
  bridgeTx?: () => void
  canBridge: boolean
  fromChainId: ChainsValues
  isApproving: boolean
  isBridging: boolean
  isLoading: boolean
  shouldApprove: boolean
}

export const BridgeButton = ({
  approvalTx,
  bridgeTx,
  canBridge,
  fromChainId,
  isApproving,
  isBridging,
  isLoading,
  shouldApprove,
}: BridgeButtonProps) => {
  const {
    appChainId,
    connectWallet,
    connectingWallet,
    isOnboardChangingChain,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
  } = useWeb3Connection()

  const appChainConfig = getNetworkConfig(fromChainId)
  const isWorking =
    isLoading || isOnboardChangingChain || connectingWallet || isApproving || isBridging
  const hasToSwitchNetwork =
    (isWalletConnected && !isWalletNetworkSupported) || fromChainId !== appChainId

  return isWorking ? (
    <ButtonPlaceholder />
  ) : !isWalletConnected ? (
    <Button onClick={connectWallet}>
      {connectingWallet ? (
        'Connecting wallet...'
      ) : (
        <>
          <Connect /> Connect Wallet
        </>
      )}
    </Button>
  ) : hasToSwitchNetwork ? (
    <Button onClick={() => pushNetwork({ chainId: appChainConfig.chainIdHex })}>
      {`Switch to ${appChainConfig.name}`}
    </Button>
  ) : shouldApprove ? (
    <Button onClick={approvalTx}>Approve</Button>
  ) : (
    <Button disabled={!canBridge} onClick={bridgeTx}>
      Bridge
    </Button>
  )
}
