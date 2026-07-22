import styled from 'styled-components'

import { Modal } from '@/src/components/modal'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Button, ButtonPrimaryCSS } from '@/src/components/buttons/Button'
import { getSupportedNetworks } from '@/src/utils/getSupportedNetworks'
import { ChainConfig } from '@/src/constants/config/types'
import { notify } from '@/src/components/toast'
import { ToastStates } from '@/src/constants/types'

const NetworkButtons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 200px;
  padding: 0 20px;
  row-gap: 20px;
  width: 100%;
`

const NetworkButton = styled(Button)`
  ${ButtonPrimaryCSS};

  border-radius: 5px;
  width: 100%;
`

export const ModalSwitchNetwork: React.FC<{ onClose: () => void }> = ({
  onClose,
  ...restProps
}) => {
  const { isSafeApp, pushNetwork, setAppChainId } = useWeb3Connection()
  const chainOptions = getSupportedNetworks()

  const handleChangeNetwork = async (chainConfig: ChainConfig) => {
    // The Safe web app is pinned to its chain and can't switch programmatically — `switchChain`
    // throws. Ask the user to reopen the app on the right chain instead. Other smart-contract
    // accounts (e.g. a Safe via Rabby) can switch, so gate on isSafeApp.
    if (isSafeApp) {
      notify({
        type: ToastStates.failed,
        message: `Open this Safe on ${chainConfig.name}`,
        id: 'switchNetwork',
      })
      return
    }
    const isSwitchedSuccess = await pushNetwork(chainConfig.chainId)
    if (isSwitchedSuccess) {
      setAppChainId(chainConfig.chainId)
      onClose()
    }
  }

  return (
    <Modal onClose={onClose} size="sm" title="Choose a network" {...restProps}>
      <NetworkButtons>
        {chainOptions.map((item, index) => (
          <NetworkButton key={`${item.chainId}_${index}`} onClick={() => handleChangeNetwork(item)}>
            {item.name}
          </NetworkButton>
        ))}
      </NetworkButtons>
    </Modal>
  )
}
