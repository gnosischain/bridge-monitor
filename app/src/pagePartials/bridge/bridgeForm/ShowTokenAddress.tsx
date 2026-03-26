import styled from 'styled-components'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { isNativeToken } from '@/src/utils/tools'

const TokenAddressWrapper = styled.div`
  padding: 0 var(--theme-common-space);
  font-size: 1.4rem;
  height: 1.4rem;
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
