import type { TokenInfo as UniswapToken } from '@uniswap/token-lists'
import Image from 'next/image'
import styled from 'styled-components'
import { BigNumberish } from 'ethers'

import { ChainToken } from '@/src/components/common/ChainToken'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { useLookupBridgedToken } from '@/src/hooks/useLookupBridgedToken'

const tokenSize = 16

const Wrapper = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space * 3}px;
  display: flex;
  flex-wrap: wrap;
  row-gap: ${({ theme: { common } }) => common.space}px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: grid;
    grid-template-columns: 1fr 10px 1fr;
  }
`

const Row = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
`

const TokenIcon = styled(ChainToken)`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  height: ${tokenSize}px;
  justify-content: center;
  width: ${tokenSize}px;

  > div {
    max-height: 100%;
    max-width: 100%;

    .iconImage {
      display: block;
    }

    > div {
      & img {
        display: block;
        max-height: ${tokenSize}px;
        max-width: ${tokenSize}px;
      }
    }
  }
`

const ArrowRight = styled(ArrowUp)`
  display: block;
  transform: rotate(-90deg);
`

const Value = styled.span`
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1;
`

interface TokenInfo {
  token: UniswapToken
  value: string
}

const TokenInfo: React.FC<TokenInfo> = ({ token, value }) => {
  return (
    <>
      <TokenIcon name={token.name}>
        <Image
          alt={token.symbol}
          className="iconImage"
          height={tokenSize}
          objectFit="cover"
          src={token.logoURI ?? '/images/icons/empty-token.png'}
          width={tokenSize}
        />
      </TokenIcon>
      <Value className="value">{value}</Value>
    </>
  )
}

interface Props {
  initiatorNetwork: string
  token: string
  bridgeName: string
  tokenValue: BigNumberish
}

export const TokenWithValue: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  token: tokenAddress,
  tokenValue,
  ...restProps
}) => {
  const { destinationToken, initiatorToken, isXdaiBridge, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress,
    tokenValue,
  })

  return (
    <Wrapper {...restProps}>
      <Row>
        <TokenInfo token={initiatorToken} value={value} />
      </Row>
      {isXdaiBridge && (
        <>
          <div className="arrowWrapper">
            <ArrowRight />
          </div>
          <Row>
            <TokenInfo token={destinationToken} value={value} />
          </Row>
        </>
      )}
    </Wrapper>
  )
}
