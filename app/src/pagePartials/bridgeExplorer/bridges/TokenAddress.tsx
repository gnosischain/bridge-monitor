import styled from 'styled-components'

import { TokenAddress as BaseTokenAddress } from '@/src/components/token/TokenAddress'
import { MiniCardHeader } from '@/src/pagePartials/bridgeExplorer/bridges/MiniCard'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsKeys } from '@/src/constants/config/types'
import { Tooltip } from '@/src/components/tooltip'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  justify-content: space-between;
  line-height: 1.2;
  padding: 0 calc(var(--theme-common-space) * 2);
`

const Address = styled(BaseTokenAddress)`
  svg {
    color: ${({ theme: { colors } }) => colors.primary_50};

    &:hover {
      color: ${({ theme: { colors } }) => colors.primary};
    }
  }
`

interface Props {
  address: string
  isNative: boolean | undefined
  network?: ChainsKeys
  tooltip: string | undefined
}

interface NativeProps extends Props {
  isNative: boolean
  tooltip: string
}

export const TokenAddress: React.FC<Props | NativeProps> = ({
  address,
  isNative,
  network,
  tooltip,
  ...restProps
}) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <Wrapper {...restProps}>
      <span>Token address</span>
      {isNative ? (
        <MiniCardHeader title={<>Native token {tooltip && <Tooltip content={tooltip} />}</>} />
      ) : (
        <Address address={address} characters={6} copy href={getExplorerUrl(address, network)} />
      )}
    </Wrapper>
  )
}
