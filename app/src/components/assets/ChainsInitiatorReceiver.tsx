import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/components/assets/ChainToken'

const Wrapper = styled.div`
  border-radius: 20px;
  display: inline-flex;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  padding: ${({ theme: { common } }) => common.space / 4}px 6px;
  background-color: ${({ theme: { colors } }) => colors.primary};
  position: relative;
  margin-top: ${({ theme: { common } }) => common.space / 8}px;
  &:before {
    content: '';
    position: absolute;
    display: block;
    width: calc(50% - 4px);
    height: 100%;
    top: 0;
    left: 0;
    background-color: ${({ theme: { colors } }) => colors.darkGrey};
    z-index: 0;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
  }
  &:after {
    content: '';
    position: absolute;
    right: calc(50% - 2px);
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 0 12px 6px;
    border-color: transparent transparent transparent ${({ theme: { colors } }) => colors.darkGrey};
    z-index: 0;
  }
`
interface Props {
  chainInitiator: string
  chainReceiver: string
  chainIconInitiator: string
  chainIconReceiver: string
}

export const ChainsInitiatorReceiver: React.FC<Props> = ({
  chainIconInitiator,
  chainIconReceiver,
  chainInitiator,
  chainReceiver,
}) => {
  return (
    <Wrapper>
      <ChainToken name={chainInitiator}>
        <Image
          alt={chainInitiator}
          height={16}
          objectFit="cover"
          src={chainIconInitiator}
          width={16}
        />
      </ChainToken>
      <ChainToken name={chainReceiver}>
        <Image
          alt={chainReceiver}
          height={16}
          objectFit="cover"
          src={chainIconReceiver}
          width={16}
        />
      </ChainToken>
    </Wrapper>
  )
}
