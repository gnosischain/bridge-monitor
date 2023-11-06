import Image from 'next/image'
import styled from 'styled-components'
import { BigNumber, BigNumberish, FixedNumber, constants } from 'ethers'

import { ChainToken } from '@/src/components/common/ChainToken'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'
import { formatNumber } from '@/src/utils/format'
import { ArrowUp } from '@/src/components/assets/ArrowUp'

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
  token,
  tokenValue,
  ...restProps
}) => {
  const { tokensByAddress } = useTokenIcons()

  const isXdaiBrigde = bridgeName === 'XDAI'
  const isZeroToken = token === constants.AddressZero

  const _token =
    isXdaiBrigde && isZeroToken
      ? { name: 'xDAI', symbol: 'xDAI', logoURI: '/images/icons/xdai.png', decimals: 18 }
      : tokensByAddress[token?.toLowerCase()]

  const value = _token
    ? formatNumber(
        +FixedNumber.fromValue(BigNumber.from(tokenValue), _token.decimals).round(4).toString(),
      )
    : tokenValue.toString()

  return (
    <Wrapper {...restProps}>
      <Row>
        <TokenIcon name={_token?.name ?? token}>
          <Image
            alt={_token?.symbol ?? token}
            className="iconImage"
            height={tokenSize}
            objectFit="cover"
            src={_token?.logoURI || '/images/icons/empty-token.png'}
            width={tokenSize}
          />
        </TokenIcon>
        <Value className="value">{value}</Value>
      </Row>
      {isXdaiBrigde && (
        <>
          <div className="arrowWrapper">
            <ArrowRight />
          </div>
          <Row>
            <TokenIcon name={isZeroToken ? 'DAI' : 'xDAI'}>
              <Image
                alt={isZeroToken ? 'DAI' : 'xDAI'}
                className="iconImage"
                height={tokenSize}
                objectFit="cover"
                src={isZeroToken ? '/images/icons/dai.png' : '/images/icons/xdai.png'}
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
