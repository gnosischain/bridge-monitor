import type { TokenInfo as UniswapToken } from '@uniswap/token-lists'
import Image from 'next/image'
import styled from 'styled-components'
import { BigNumberish } from 'ethers'

import { ChainToken } from '@/src/components/common/ChainToken'
import { useLookupBridgedToken } from '@/src/hooks/useLookupBridgedToken'

const tokenSize = 16

const Wrapper = styled.div`
  align-items: center;
  column-gap: 6px;
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

const Label = styled.span`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
  opacity: 0.6;
`

Label.defaultProps = {
  className: 'label',
}

const Value = styled.span`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.2;
`

Value.defaultProps = {
  className: 'value',
}

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
          key={token.symbol}
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
  bridgeName: string
  initiatorNetwork: string
  token: string
  tokenValue: BigNumberish
}

export const Initiator: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  token: tokenAddress,
  tokenValue,
  ...restProps
}) => {
  const { initiatorToken, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress,
    tokenValue,
  })

  return (
    <Wrapper {...restProps}>
      <Label>Sent:</Label>
      <TokenInfo token={initiatorToken} value={value} />
    </Wrapper>
  )
}

export const Receiver: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  token: tokenAddress,
  tokenValue,
  ...restProps
}) => {
  const { destinationToken, isXdaiBridge, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress,
    tokenValue,
  })

  return isXdaiBridge ? (
    <Wrapper {...restProps}>
      <Label>Received:</Label>
      <TokenInfo token={destinationToken} value={value} />
    </Wrapper>
  ) : (
    <></>
  )
}
