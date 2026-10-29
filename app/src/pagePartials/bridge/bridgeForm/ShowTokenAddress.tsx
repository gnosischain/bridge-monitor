import styled from 'styled-components'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { isNativeToken } from '@/src/utils/tools'

const TokenAddressWrapper = styled.div`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.3rem;
  margin-left: auto;

  button,
  svg {
    color: ${({ theme: { colors } }) => colors.fog};
  }

  button:hover,
  svg:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }
`

export const ShowTokenAddress: React.FC<{ address: string; explorerUrl: string }> = ({
  address,
  explorerUrl,
}) => {
  const show = address && !isNativeToken(address)
  return (
    <TokenAddressWrapper>
      {show && <TokenAddress address={address} characters={6} copy href={explorerUrl} />}
    </TokenAddressWrapper>
  )
}
