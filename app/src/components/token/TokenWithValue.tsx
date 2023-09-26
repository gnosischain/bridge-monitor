import Image from 'next/image'
import styled from 'styled-components'

import { ChainToken } from '@/src/components/common/ChainToken'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'
import { BigNumber, BigNumberish, FixedNumber } from 'ethers'

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
  overflow: hidden;
  width: ${tokenSize}px;

  > div {
    max-height: 100%;
    max-width: 100%;

    .iconImage {
      display: block;
    }

    > div {
      &,
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
  tokenValue: BigNumberish
}

export const TokenWithValue: React.FC<Props> = ({ token, tokenValue, ...restProps }) => {
  const { tokensByAddress } = useTokenIcons()
  const _token = tokensByAddress[token?.toLowerCase()]

  return (
    <Wrapper {...restProps}>
      <Label className="label">Amount:</Label>
      <TokenIcon name={token}>
        <Image
          alt={token}
          className="iconImage"
          height={tokenSize}
          objectFit="cover"
          src={_token?.logoURI || '/images/icons/empty-token.png'}
          width={tokenSize}
        />
      </TokenIcon>
      <Value className="value">
        {_token
          ? FixedNumber.fromValue(BigNumber.from(tokenValue), _token.decimals).round(4).toString()
          : tokenValue.toString()}
      </Value>
    </Wrapper>
  )
}
