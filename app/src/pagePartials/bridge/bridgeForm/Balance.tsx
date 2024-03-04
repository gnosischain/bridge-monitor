import styled from 'styled-components'
import { Token } from '@/types/token'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

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
  line-height: 1.2;
  opacity: 0.7;
`

const Value = styled.span`
  line-height: 1.2;
  font-weight: 400;
`

export const Balance: React.FC<{ token: Token | undefined; value: string; loading?: boolean }> = ({
  loading,
  token,
  value,
}) => {
  return (
    <Wrapper>
      <Title>Balance:</Title>
      {loading ? (
        <SkeletonLoading style={{ minWidth: 0, minHeight: 0, height: '16px', width: '52px' }} />
      ) : (
        <>
          {token && <TokenIcon dimensions={16} iconSource={token?.logoURI} symbol={token.symbol} />}
          {<Value>{!value || value === '0' ? '0.00' : value}</Value>}
        </>
      )}
    </Wrapper>
  )
}
