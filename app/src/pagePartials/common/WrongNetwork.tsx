import styled, { keyframes } from 'styled-components'

import { ButtonPrimary } from '@/src/components/buttons/Button'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

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
  const { appChainId, isWalletConnected, isWalletNetworkSupported, pushNetwork } =
    useWeb3Connection()
  return isWalletConnected && !isWalletNetworkSupported ? (
    <ButtonPrimary onClick={() => pushNetwork(appChainId)}>
      <Content>Switch to valid network</Content>
    </ButtonPrimary>
  ) : null
}
