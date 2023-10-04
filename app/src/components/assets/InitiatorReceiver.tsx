import Image from 'next/image'
import styled from 'styled-components'

import { Address } from '@/src/components/token/Address'
import { ChainToken } from '@/src/components/assets/ChainToken'

const Wrapper = styled.div`
  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    display: flex;
    align-items: center;
    gap: ${({ theme: { common } }) => common.space * 2}px;
    min-width: 250px;
  }
`
const Tokens = styled.div`
  display: flex;
  gap: ${({ theme: { common } }) => common.space}px;
`
const Value = styled.strong`
  font-size: 12px;
  font-weight: 400;
`

interface Props {
  address: string
  token: string
  tokenIcon: string
  tokenValue: string
  scanLink?: string
}

export const InitiatorReceiver: React.FC<Props> = ({
  address,
  scanLink,
  token,
  tokenIcon,
  tokenValue,
}) => {
  return (
    <Wrapper>
      <Address address={address} copy link={scanLink} />
      <Tokens>
        <ChainToken name={token}>
          <Image alt={token} height={16} objectFit="cover" src={tokenIcon} width={16} />
        </ChainToken>
        <Value className="number">{tokenValue}</Value>
      </Tokens>
    </Wrapper>
  )
}
