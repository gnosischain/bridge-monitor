import Image from 'next/image'
import styled from 'styled-components'
import { TokenUsdc } from './types'

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: var(--theme-common-space);
  display: flex;
  flex-shrink: 0;
  font-size: 1.6rem;
  font-weight: 600;
  white-space: nowrap;
`

export const TokenInfo = ({ token }: { token: TokenUsdc }) => {
  return (
    <Wrapper>
      {token.logoURI && (
        <Image
          alt={token.name}
          height={24}
          src={token.logoURI as string}
          style={{
            objectFit: 'cover',
          }}
          width={24}
        />
      )}
      {token.symbol}
    </Wrapper>
  )
}
