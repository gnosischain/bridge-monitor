import Image from 'next/image'
import styled from 'styled-components'
import { TokenUsdc } from './types'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 8px;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.6rem;
  font-weight: 400;
  height: 40px;
  padding: 0 calc(var(--theme-common-space) * 2);
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
