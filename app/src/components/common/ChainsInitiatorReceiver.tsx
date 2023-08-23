import Image from 'next/image'
import styled from 'styled-components'
import { getIcon } from '@/src/utils/icons'

const Wrapper = styled.div`
  --height: 22px;

  display: flex;
  height: 22px;
  margin-top: auto;
`
const BridgeWrapper = styled.div<{ chain?: string }>`
  align-items: center;
  background: ${(props) =>
    props.chain === 'gnosis'
      ? ({ theme }) => theme.colors.primary
      : ({ theme }) => theme.colors.darkerGrey};
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  font-size: 1.2rem;
  gap: ${({ theme: { common } }) => common.space / 2}px;
  justify-content: center;
  padding: 0 ${({ theme: { common } }) => common.space / 2}px;
  position: relative;

  > span {
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  &:first-child {
    border-bottom-left-radius: calc(var(--height) / 2);
    border-top-left-radius: calc(var(--height) / 2);
  }

  &:last-child {
    border-bottom-right-radius: calc(var(--height) / 2);
    border-top-right-radius: calc(var(--height) / 2);
    padding-left: ${({ theme: { common } }) => common.space + common.space / 2}px;
    padding-right: ${({ theme: { common } }) => common.space}px;
  }

  &:first-child {
    &:after {
      border-color: transparent transparent transparent
        ${(props) =>
          props.chain === 'gnosis'
            ? ({ theme }) => theme.colors.primary
            : ({ theme }) => theme.colors.darkGrey};
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

interface Props {
  chainInitiator: string
  chainReceiver: string
  chainIconInitiator: string
  chainIconReceiver: string
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
      <BridgeWrapper chain={chainInitiator.toLowerCase()}>
        <Image
          alt={chainInitiator}
          height={16}
          objectFit="cover"
          src={getIcon(chainIconInitiator)}
          width={16}
        />
        {chainInitiator}
      </BridgeWrapper>
      <BridgeWrapper chain={chainReceiver.toLowerCase()}>
        <Image
          alt={chainReceiver}
          height={16}
          objectFit="cover"
          src={getIcon(chainIconReceiver)}
          width={16}
        />
        {chainReceiver}
      </BridgeWrapper>
    </Wrapper>
  )
}
