import Image from 'next/image'
import styled from 'styled-components'
import { BigNumber, BigNumberish, FixedNumber, constants } from 'ethers'

import { ChainToken } from '@/src/components/common/ChainToken'
import { useBridgedTokens } from '@/src/providers/tokenIconsProvider'
import { formatNumber } from '@/src/utils/format'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { useDaiToken } from '@/src/hooks/useDaiToken'

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

interface Props {
  token: string
  bridgeName: string
  tokenValue: BigNumberish
}

export const TokenWithValue: React.FC<Props> = ({
  bridgeName,
  token: tokenAddress,
  tokenValue,
  ...restProps
}) => {
  const { gnosisXdaiToken, mainnetDaiToken } = useDaiToken()
  const { tokensByAddress } = useBridgedTokens()

  tokenAddress = tokenAddress?.toLowerCase()
  const isXdaiBridge = bridgeName === 'XDAI'
  const isZeroToken = tokenAddress === constants.AddressZero
  const isNativeInXdaiBridge = isXdaiBridge && isZeroToken

  const token = isNativeInXdaiBridge ? gnosisXdaiToken : tokensByAddress[tokenAddress]
  const xDaiBridgedToken = isNativeInXdaiBridge ? mainnetDaiToken : gnosisXdaiToken

  const value = token
    ? formatNumber(
        +FixedNumber.fromValue(BigNumber.from(tokenValue), token.decimals).round(4).toString(),
      )
    : tokenValue.toString()

  return (
    <Wrapper {...restProps}>
      <Row>
        <TokenIcon name={token?.name ?? token}>
          <Image
            alt={token?.symbol ?? token}
            className="iconImage"
            height={tokenSize}
            objectFit="cover"
            src={token?.logoURI || '/images/icons/empty-token.png'}
            width={tokenSize}
          />
        </TokenIcon>
        <Value className="value">{value}</Value>
      </Row>
      {isXdaiBridge && (
        <>
          <div className="arrowWrapper">
            <ArrowRight />
          </div>
          <Row>
            <TokenIcon name={xDaiBridgedToken.name}>
              <Image
                alt={xDaiBridgedToken.symbol}
                className="iconImage"
                height={tokenSize}
                objectFit="cover"
                src={xDaiBridgedToken.logoURI as string}
                width={tokenSize}
              />
            </TokenIcon>
            <Value className="value">{value}</Value>
          </Row>
        </>
      )}
    </Wrapper>
  )
}
