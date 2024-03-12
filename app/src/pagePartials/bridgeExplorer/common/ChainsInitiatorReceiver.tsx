import { getIcon } from '@/src/utils/icons'
import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.div`
  --height: 22px;

  display: flex;
  height: var(--height);
`
const Chain = styled.div<{ chain?: string }>`
  align-items: center;
  background: ${({ chain, theme: { colors } }) =>
    chain === 'gnosis' ? colors.primary : colors.white};
  color: ${({ chain, theme: { colors } }) => (chain === 'gnosis' ? colors.white : colors.primary)};
  display: flex;
  font-size: 1.2rem;
  gap: calc(var(--theme-common-space) / 2);
  justify-content: center;
  line-height: 1.2;
  min-width: fit-content;
  padding: 0 calc(var(--theme-common-space) / 2);
  position: relative;
  text-transform: capitalize;

  > span {
    border-radius: 50%;
    flex-shrink: 0;
  }

  &:first-child {
    border-bottom-left-radius: calc(var(--height) / 2);
    border-top-left-radius: calc(var(--height) / 2);
  }

  &:last-child {
    border-bottom-right-radius: calc(var(--height) / 2);
    border-top-right-radius: calc(var(--height) / 2);
    padding-left: calc(var(--theme-common-space) + var(--theme-common-space) / 2);
    padding-right: var(--theme-common-space);
  }

  &:first-child {
    &:after {
      border-color: transparent transparent transparent
        ${(props) =>
          props.chain === 'gnosis'
            ? ({ theme }) => theme.colors.primary
            : ({ theme }) => theme.colors.white};
      border-style: solid;
      border-width: 12px 0 12px 6px;
      content: '';
      display: inline-block;
      height: 0;
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      z-index: 2;
    }
  }
`

const Bridge: React.FC<{ chain: string; iconName?: string }> = ({
  chain,
  iconName,
  ...restProps
}) => {
  const iconPath = getIcon(iconName)

  return iconPath ? (
    <Chain chain={chain.toLowerCase()} {...restProps}>
      <Image alt={chain} height={16} objectFit="cover" src={iconPath} width={16} />
      {chain}
    </Chain>
  ) : null
}

interface Props {
  chainInitiator: string
  chainReceiver: string
  chainIconInitiator?: string
  chainIconReceiver?: string
  showName?: boolean
}

export const ChainsInitiatorReceiver: React.FC<Props> = ({
  chainIconInitiator,
  chainIconReceiver,
  chainInitiator,
  chainReceiver,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Bridge chain={chainInitiator} iconName={chainIconInitiator} />
      <Bridge chain={chainReceiver} iconName={chainIconReceiver} />
    </Wrapper>
  )
}
