import { getChainKey, getNetworkConfig } from '@/src/constants/config/chains'
import { ChainsValues } from '@/src/constants/config/types'
import { getIcon } from '@/src/utils/icons'
import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: calc(var(--theme-common-space) * 0.75);
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.2;
  text-transform: capitalize;
`

export const Chain = ({ chainId }: { chainId: ChainsValues }) => {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
  const chainConfig = getNetworkConfig(chainId)
  const chainKey = getChainKey(chainId)
  return (
    <Wrapper>
      <Image
        alt={chainKey}
        height={20}
        src={getIcon(`${capitalize(chainKey)}Big`)}
        style={{
          objectFit: 'cover',
        }}
        width={20}
      />
      {chainConfig.shortName}
    </Wrapper>
  )
}
