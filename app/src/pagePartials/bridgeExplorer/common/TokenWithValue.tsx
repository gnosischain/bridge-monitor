import type { TokenInfo as TokenProps } from '@/types/token'
import styled, { css } from 'styled-components'
import { ChainToken } from '@/src/pagePartials/bridgeExplorer/validators/ChainToken'
import { useLookupBridgedToken } from '@/src/hooks/useLookupBridgedToken'
import { genericSuspense } from '@/src/components/safeSuspense'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
// import TokenListProvider from '@/src/providers/tokenListProvider'

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
  color: ${({ theme: { colors } }) => colors.primary};
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
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.2;
`

Value.defaultProps = {
  className: 'value',
}

interface Props {
  bridgeName: string
  initiatorNetwork: string
  receiverToken?: string
  token: string
  tokenValue: string
}

const Loading: React.FC<{
  label: string
}> = ({ label }) => {
  return (
    <Wrapper>
      <Label>{label}:</Label>
      <SkeletonLoading style={{ height: `${tokenSize}px`, minHeight: '0' }} />
    </Wrapper>
  )
}

const TokenInfo: React.FC<{
  initiatorToken: TokenProps
  isLoading?: boolean
  label: string
  value: string
}> = ({ initiatorToken, isLoading, label, value, ...restProps }) => {
  const { logoURI, name, symbol } = initiatorToken

  return isLoading ? (
    <Loading label={label} />
  ) : (
    <Wrapper {...restProps}>
      <Label>{label}:</Label>
      <TokenIcon name={name}>
        <Img alt={symbol} className="iconImage" src={logoURI ?? '/images/icons/empty-token.png'} />
      </TokenIcon>
      <Value className="value">{value}</Value>
    </Wrapper>
  )
}

const receivedLabel = 'Received'
const sentLabel = 'Sent'

const InitiatorToken: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  token: tokenAddress,
  tokenValue,
  ...restProps
}) => {
  const { initiatorToken, isLoading, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress,
    tokenValue,
  })

  return (
    <TokenInfo
      initiatorToken={initiatorToken}
      isLoading={isLoading}
      label={sentLabel}
      value={value}
      {...restProps}
    />
  )
}

const ReceiverToken: React.FC<Props> = ({
  bridgeName,
  initiatorNetwork,
  receiverToken,
  token: tokenAddress,
  tokenValue,
  ...restProps
}) => {
  const { initiatorToken, isLoading, isXdaiBridge, value } = useLookupBridgedToken({
    bridgeName,
    initiatorNetwork,
    tokenAddress: receiverToken ?? tokenAddress,
    tokenValue,
  })

  return isXdaiBridge ? (
    <TokenInfo
      initiatorToken={initiatorToken}
      isLoading={isLoading}
      label={receivedLabel}
      value={value}
      {...restProps}
    />
  ) : (
    <></>
  )
}

export const Initiator: React.FC<Props> = genericSuspense(
  ({ ...restProps }) => <InitiatorToken {...restProps} />,
  () => <Loading label={sentLabel} />,
)

export const Receiver: React.FC<Props> = genericSuspense(
  ({ ...restProps }) => <ReceiverToken {...restProps} />,
  () => <Loading label={receivedLabel} />,
)
