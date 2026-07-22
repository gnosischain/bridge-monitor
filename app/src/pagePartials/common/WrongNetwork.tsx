import styled, { keyframes } from 'styled-components'

import { ButtonPrimary } from '@/src/components/buttons/Button'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { notify } from '@/src/components/toast'
import { ToastStates } from '@/src/constants/types'
import { getNetworkConfig } from '@/src/constants/config/chains'

const loadingAnimation = keyframes`
  0% {
    opacity: var(--inline-loading-opacity-start);
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: var(--inline-loading-opacity-start);
  }
`

const Content = styled.div`
  --inline-loading-opacity-start: 0.4;

  align-items: center;
  animation-delay: 0;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: ${loadingAnimation};
  animation-timing-function: ease-in-out;
  color: ${({ theme: { colors } }) => colors.error};
  display: flex;
  font-style: italic;
`

export default function WrongNetwork() {
  const { appChainId, isSafeApp, isWalletConnected, isWalletNetworkSupported, pushNetwork } =
    useWeb3Connection()

  if (!isWalletConnected || isWalletNetworkSupported) {
    return null
  }

  const handleSwitch = () => {
    // The Safe web app is pinned to its chain and can't switch programmatically — `switchChain`
    // throws. Ask the user to reopen the app on a supported chain instead. Other smart-contract
    // accounts (e.g. a Safe via Rabby) can switch, so gate on isSafeApp.
    if (isSafeApp) {
      notify({
        type: ToastStates.failed,
        message: `Open this Safe on ${getNetworkConfig(appChainId).name}`,
        id: 'switchNetwork',
      })
      return
    }
    pushNetwork(appChainId)
  }

  return (
    <ButtonPrimary onClick={handleSwitch}>
      <Content>Switch to valid network</Content>
    </ButtonPrimary>
  )
}
