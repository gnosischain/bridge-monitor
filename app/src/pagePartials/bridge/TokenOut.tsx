import styled from 'styled-components'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Token } from '@/types/token'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

const NoTokenSelected = styled.span`
  font-size: 1.5rem;
  opacity: 0.8;
`

const TokenOutValue = styled.span<{ disabled?: boolean }>`
  font-size: 1.5rem;
  font-weight: 500;
  margin-left: auto;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
    font-weight: 600;
  }
`

export const TokenOut: React.FC<{ tokenOut?: Token; value?: string }> = ({ tokenOut, value }) => (
  <>
    {tokenOut ? (
      <>
        <TokenIcon dimensions={24} iconSource={tokenOut.logoURI} symbol={tokenOut.symbol} />
        {tokenOut.symbol}
        <TokenOutValue>{value}</TokenOutValue>
      </>
    ) : (
      <>
        <SkeletonLoading
          animate={false}
          style={{
            borderRadius: '50%',
            height: '24px',
            width: '24px',
            minWidth: '0',
          }}
        />
        <NoTokenSelected>No token selected</NoTokenSelected>
        <TokenOutValue disabled>0.00</TokenOutValue>
      </>
    )}
  </>
)
