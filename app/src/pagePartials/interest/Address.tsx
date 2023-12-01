import styled from 'styled-components'

import { MiniCard, MiniCardTitle, MiniCardValue } from '@/src/components/common/MiniCard'
import { Address as AddressExplorerURL } from '@/src/components/token/Address'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const Wrapper = styled(MiniCard)`
  flex-direction: column;
`

export const Address: React.FC<{ title: string; tooltip?: string; address: string }> = ({
  address,
  title,
  tooltip,
  ...restProps
}) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <Wrapper {...restProps}>
      <MiniCardTitle title={title} tooltip={tooltip} />
      <MiniCardValue>
        <AddressExplorerURL address={address} characters={8} copy link={getExplorerUrl(address)} />
      </MiniCardValue>
    </Wrapper>
  )
}
