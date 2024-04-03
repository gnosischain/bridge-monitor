import { getChainKey, getNetworkConfig } from '@/src/constants/config/chains'
import { ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import { getIcon } from '@/src/utils/icons'
import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 8px;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.6rem;
  font-weight: 400;
  height: 40px;
  padding: 0 calc(var(--theme-common-space) * 2);
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
        height={24}
        objectFit="cover"
        src={getIcon(`${capitalize(chainKey)}Big`)}
        width={24}
      />
      {chainConfig.shortName}
    </Wrapper>
  )
}
