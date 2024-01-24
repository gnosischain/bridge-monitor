import styled from 'styled-components'

import { Modal } from '@/src/components/modal'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Button, ButtonPrimaryCSS } from '@/src/components/buttons/Button'
import { getSupportedNetworks } from '@/src/utils/getSupportedNetworks'
import { ChainConfig } from '@/src/constants/config/types'

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
  const { pushNetwork, setAppChainId } = useWeb3Connection()
  const chainOptions = getSupportedNetworks()

  const handleChangeNetwork = async (chainConfig: ChainConfig) => {
    const isSwitchedSuccess = await pushNetwork({ chainId: chainConfig.chainIdHex })
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
