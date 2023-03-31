import styled from 'styled-components'

import { Address } from '@/src/components/token/Address'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  justify-content: space-between;
  line-height: 1.2;
`

interface Props {
  address: string
}

export const TokenAddress: React.FC<Props> = ({ address, ...restProps }) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <Wrapper {...restProps}>
      <span>Token address</span> <Address address={address} copy link={getExplorerUrl(address)} />
    </Wrapper>
  )
}
