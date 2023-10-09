import Image from 'next/image'
import styled from 'styled-components'
import { BigNumber, BigNumberish, FixedNumber, constants } from 'ethers'

import { ChainToken } from '@/src/components/common/ChainToken'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'
import { formatNumber } from '@/src/utils/format'

const tokenSize = 16

const Wrapper = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
`

const Label = styled.span`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    display: block;
    font-size: 1.2rem;
    font-weight: 400;
    line-height: 1.2;
    opacity: 0.8;
  }
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

const Value = styled.span`
  font-size: 1.2rem;
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

  const isXdai = bridgeName === 'XDAI'
  const isZeroToken = token === constants.AddressZero

  const _token =
    isXdai && isZeroToken
      ? { name: 'xDAI', symbol: 'xDAI', logoURI: '/images/icons/xdai.png', decimals: 18 }
      : tokensByAddress[token?.toLowerCase()]

  const xdaiReceiverToken = (
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
  )

  return (
    <Wrapper {...restProps}>
      <Label className="label">Amount:</Label>
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
      {isXdai && '>'}
      {isXdai && xdaiReceiverToken}
      <Value className="value">
        {_token
          ? formatNumber(
              +FixedNumber.fromValue(BigNumber.from(tokenValue), _token.decimals)
                .round(4)
                .toString(),
            )
          : tokenValue.toString()}
      </Value>
    </Wrapper>
  )
}
