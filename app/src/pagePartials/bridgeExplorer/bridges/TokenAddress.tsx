import styled from 'styled-components'

import { TokenAddress as Address } from '@/src/components/token/TokenAddress'
import { MiniCardTitle } from '@/src/pagePartials/bridgeExplorer/bridges/MiniCard'
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
        <MiniCardTitle title={<>Native token {tooltip && <Tooltip content={tooltip} />}</>} />
      ) : (
        <Address address={address} characters={6} copy href={getExplorerUrl(address, network)} />
      )}
    </Wrapper>
  )
}
