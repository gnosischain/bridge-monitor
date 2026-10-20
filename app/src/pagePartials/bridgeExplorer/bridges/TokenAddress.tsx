import styled from 'styled-components'

import { TokenAddress as BaseTokenAddress } from '@/src/components/token/TokenAddress'
import { Fact } from '@/src/pagePartials/bridgeExplorer/bridges/Fact'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsKeys } from '@/src/constants/config/types'

const Address = styled(BaseTokenAddress)`
  svg {
    color: ${({ theme: { colors } }) => colors.faint};

    &:hover {
      color: ${({ theme: { colors } }) => colors.ink};
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

  return isNative ? (
    <Fact label="Token address" tooltip={tooltip} {...restProps}>
      Native token
    </Fact>
  ) : (
    <Fact label="Token address" {...restProps}>
      <Address address={address} characters={6} copy href={getExplorerUrl(address, network)} />
    </Fact>
  )
}
