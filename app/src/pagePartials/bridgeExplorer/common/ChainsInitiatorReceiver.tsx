import { getIcon } from '@/src/utils/icons'
import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: 999px;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: 6px;
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: 500;
  height: 26px;
  line-height: 1;
  padding: 0 10px 0 4px;
  white-space: nowrap;
  width: fit-content;
`

const Chain = styled.span`
  align-items: center;
  column-gap: 5px;
  display: flex;
  text-transform: capitalize;

  > img {
    border-radius: 50%;
    flex-shrink: 0;
  }
`

const Arrow = styled.span`
  color: ${({ theme: { colors } }) => colors.faint};
`

const Bridge: React.FC<{ chain: string; iconName?: string }> = ({
  chain,
  iconName,
  ...restProps
}) => {
  const iconPath = getIcon(iconName)

  return iconPath ? (
    <Chain {...restProps}>
      <Image alt={chain} height={16} src={iconPath} style={{ objectFit: 'cover' }} width={16} />
      {chain}
    </Chain>
  ) : null
}

interface Props {
  $chainInitiator: string
  $chainReceiver: string
  $chainIconInitiator?: string
  $chainIconReceiver?: string
}

export const ChainsInitiatorReceiver: React.FC<Props> = ({
  $chainIconInitiator,
  $chainIconReceiver,
  $chainInitiator,
  $chainReceiver,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Bridge chain={$chainInitiator} iconName={$chainIconInitiator} />
      <Arrow aria-hidden="true">→</Arrow>
      <Bridge chain={$chainReceiver} iconName={$chainIconReceiver} />
    </Wrapper>
  )
}
