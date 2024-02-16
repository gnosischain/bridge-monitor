import styled from 'styled-components'
import { TokenIcon } from '@/src/components/token/TokenIcon'

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 1.6rem;
  gap: 4px;
  line-height: 1.2;
`

const Title = styled.span`
  font-weight: 300;
  opacity: 0.7;
`

const Value = styled.span`
  font-weight: 400;
`

export const Balance: React.FC<{ logoURI: string | undefined; symbol: string; value: string }> = ({
  logoURI,
  symbol,
  value,
}) => {
  return (
    <Wrapper>
      <Title>Balance:</Title> <TokenIcon dimensions={16} iconSource={logoURI} symbol={symbol} />
      <Value>{value}</Value>
    </Wrapper>
  )
}
