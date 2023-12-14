import type { TokenInfo as TokenProps } from '@uniswap/token-lists'
import styled, { css } from 'styled-components'
import { BigNumberish } from 'ethers'
import { ChainToken } from '@/src/components/common/ChainToken'
import { useLookupBridgedToken } from '@/src/hooks/useLookupBridgedToken'
import { InlineLoading } from '@/src/components/loading/InlineLoading'

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
`

const Img = styled.img`
  display: block;
  border-radius: 50%;
  height: ${tokenSize}px;
  object-fit: cover;
  width: ${tokenSize}px;
`

const TextCSS = css`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

const Label = styled.span`
  ${TextCSS}
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

const Loading = styled(InlineLoading)`
  ${TextCSS}
`

interface Props {
  bridgeName: string
  initiatorNetwork: string
  token: string
  tokenValue: BigNumberish
}

const TokenInfo: React.FC<{
  initiatorToken: TokenProps
  isLoading: boolean
  label: string
  value: string
}> = ({ initiatorToken, isLoading, label, value }) => {
  const { logoURI, name, symbol } = initiatorToken

  return isLoading ? (
    <Loading />
  ) : (
    <Wrapper>
      <Label>{label}:</Label>
      <TokenIcon name={name}>
        <Img
          alt={symbol}
          className="iconImage"
          // key={symbol}
          src={logoURI ?? '/images/icons/empty-token.png'}
        />
      </TokenIcon>
      <Value className="value">{value}</Value>
    </Wrapper>
  )
}

export const Initiator: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  token: tokenAddress,
  tokenValue,
}) => {
  const { initiatorToken, isLoading, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress,
    tokenValue,
  })

  return (
    <TokenInfo initiatorToken={initiatorToken} isLoading={isLoading} label="Sent" value={value} />
  )
}

export const Receiver: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  token: tokenAddress,
  tokenValue,
}) => {
  const { destinationToken, isLoading, isXdaiBridge, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress,
    tokenValue,
  })

  return !isXdaiBridge ? (
    <></>
  ) : (
    <TokenInfo
      initiatorToken={destinationToken}
      isLoading={isLoading}
      label="Received"
      value={value}
    />
  )
}
