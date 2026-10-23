import styled from 'styled-components'

import { Modal } from '@/src/components/modal'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Button, ButtonPrimaryCSS } from '@/src/components/buttons/Button'
import { getSupportedNetworks } from '@/src/utils/getSupportedNetworks'
import { ChainConfig } from '@/src/constants/config/types'

const NetworkButtons = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 3);
  row-gap: var(--theme-common-space);
`

const NetworkButton = styled(Button)`
  ${ButtonPrimaryCSS};

  font-size: 1.5rem;
  height: 48px;
  padding: 0 calc(var(--theme-common-space) * 3);
  width: 100%;
`

export const ModalSwitchNetwork: React.FC<{ onClose: () => void }> = ({
  onClose,
  ...restProps
}) => {
  const { pushNetwork, setAppChainId } = useWeb3Connection()
  const chainOptions = getSupportedNetworks()

  const handleChangeNetwork = async (chainConfig: ChainConfig) => {
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
