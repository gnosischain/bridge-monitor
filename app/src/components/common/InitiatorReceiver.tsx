import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/components/common/ChainToken'
import { Address } from '@/src/components/token/Address'

const Wrapper = styled.div<{ inline?: boolean }>`
  display: ${(props) => (props.inline ? 'flex' : 'block')};
  gap: ${({ theme: { common } }) => common.space}px;
  justify-content: ${(props) => (props.inline ? 'space-between' : 'flex-start')};

  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    align-items: center;
    display: flex;
    gap: ${({ theme: { common } }) => common.space * 2}px;
    min-width: 250px;
  }
`
const Tokens = styled.div`
  align-items: center;
  display: flex;
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
`
const Value = styled.strong<{ bigNumber?: boolean }>`
  font-size: ${(props) => (props.bigNumber ? '2.1rem' : '1.2rem')};
  font-weight: 400;
  line-height: 1;
`

interface Props {
  address: string
  bigNumber?: boolean
  inline?: boolean
  scanLink?: string
  token: string
  tokenIcon: string
  tokenValue: string
}

export const InitiatorReceiver: React.FC<Props> = ({
  address,
  bigNumber,
  inline,
  scanLink,
  token,
  tokenIcon,
  tokenValue,
}) => {
  return (
    <Wrapper inline={inline}>
      <Address address={address} characters={6} copy link={scanLink} />
      <Tokens>
        <ChainToken name={token}>
          <Image alt={token} height={16} objectFit="cover" src={tokenIcon} width={16} />
        </ChainToken>
        <Value bigNumber={bigNumber} className="number">
          {tokenValue}
        </Value>
      </Tokens>
    </Wrapper>
  )
}
