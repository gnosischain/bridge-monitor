import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { isAddress } from '@ethersproject/address'
import { DebounceInput } from 'react-debounce-input'

import { ChevronDown as BaseChevronDown } from '@/src/components/assets/ChevronDown'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import {
  Dropdown as BaseDropdown,
  DropdownBridgeItem,
  DropdownPosition,
} from '@/src/components/dropdown'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import dynamic from 'next/dynamic'
import orderBy from 'lodash/orderBy'

const TokenListProvider = dynamic(() => import('@/src/providers/tokenListProvider'), {
  ssr: false,
})

const Wrapper = styled(BaseDropdown)`
  --inner-padding: calc(var(--theme-common-space) * 2);
  flex-shrink: 0;
  .dropdownItems {
    max-height: 350px;
    width: 300px;
    overflow: auto;
    @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      width: 440px;
    }
  }

  &[disabled] {
    opacity: 1;
  }
`

const TextfieldContainer = styled.div<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  padding: calc(var(--theme-common-space) * 2);
  position: sticky;
  top: 0;
  z-index: 1;
`

const TextFieldWrapper = styled.div`
  position: relative;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Textfield: any = styled(DebounceInput)`
  --texfield-font-size: 1.6rem;

  ${TextfieldCSS};

  border-radius: ${({ theme: { common } }) => common.borderRadius};
  padding: calc(var(--theme-common-space) * 2) var(--theme-common-space)
    calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 5);
  flex-shrink: 0;
  height: auto;
  max-width: 100%;
  width: 100%;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2)
      calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 5);
  }
`

const Magnifier = styled(BaseMagnifier)`
  left: 10px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`

const Items = styled.div<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  padding: 0 0 calc(var(--theme-common-space) / 2);
`

const DropdownItem2 = styled.div``
const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: normal;
  strong {
    font-size: 1.8rem;
    font-weight: 500;
  }
`
const NoResults = styled.div<{ closeOnClick?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 1.6rem;
  font-weight: 500;
  height: 80px;
  justify-content: center;
  line-height: 1.2;
  padding: var(--inner-padding);
`

const Button = styled.button`
  align-items: center;
  background: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: none;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: var(--theme-common-space);
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  height: 34px;
  justify-content: space-between;
  line-height: 1.2;
  margin: 0;
  padding: 0 8px;
  small {
    font-size: 1.4rem;
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
  }
`

const ButtonText = styled.span``

const ChevronDown = styled(BaseChevronDown)`
  .fill {
    fill: ${({ theme: { colors } }) => colors.primary};
  }
`

interface Props {
  chainId: ChainsValues
  defaultToken?: Token
  disabled?: boolean
  onChange?: (token: Token) => void
}

const Dropdown: React.FC<Props> = ({
  chainId,
  defaultToken,
  disabled = false,
  onChange,
  ...restProps
}) => {
  const [isOpened, setIsOpened] = useState(false)
  const [searchInputRef, setSearchInputInputRef] = useState<HTMLInputElement | null>(null)
  const [token, setToken] = useState<Token | undefined>(defaultToken)
  const { ambTokensByNetwork } = useBridgedTokens()
  const tokens = useMemo(() => {
    if (([Chains.mainnet, Chains.gnosis] as Array<number>).includes(chainId)) {
      return ambTokensByNetwork[chainId] ?? []
    }
  }, [chainId, ambTokensByNetwork])

  const [tokensList, setTokensList] = useState(tokens)
  const [value, setValue] = useState('')

  const onSelectToken = (token: Token) => {
    setToken(token)
    if (typeof onChange !== 'undefined') onChange(token)
  }

  useEffect(() => {
    if (defaultToken && defaultToken.address.toLowerCase() !== token?.address.toLowerCase()) {
      setToken(defaultToken)
    }
    if (!defaultToken && token) {
      setToken(undefined)
    }
  }, [defaultToken, token])

  useEffect(() => {
    if (value.length === 0) {
      setTokensList(tokens)
    } else {
      if (isAddress(value)) {
        setTokensList(tokens?.filter((item) => item.address.toLowerCase() === value.toLowerCase()))
      } else {
        // Sort the tokens so that exact matches are at the top
        const sortedTokens = orderBy(
          tokens?.filter((item) => item.symbol.toLowerCase().includes(value.toLowerCase())),
          (token) => token?.symbol.toLowerCase() !== value.toLowerCase(),
          ['asc'],
        )
        setTokensList(sortedTokens)
      }
    }
  }, [tokens, value])

  useEffect(() => {
    if (isOpened && searchInputRef) {
      searchInputRef.focus()
    }
  }, [searchInputRef, isOpened])

  return (
    <Wrapper
      disabled={disabled}
      dropdownButton={
        <Button onClick={() => setIsOpened(!isOpened)} type="button">
          {token && <TokenIcon dimensions={24} iconSource={token.logoURI} symbol={token.symbol} />}
          <ButtonText>{token ? token.symbol : <small>Select token...</small>}</ButtonText>
          {!disabled && <ChevronDown />}
        </Button>
      }
      dropdownPosition={DropdownPosition.left}
      items={[
        <TextfieldContainer closeOnClick={false} key="tokenSearchInput">
          <TextFieldWrapper>
            <Magnifier />
            <Textfield
              debounceTimeout={300}
              inputRef={setSearchInputInputRef}
              onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
              placeholder="Search asset"
              type="search"
              value={value}
            />
          </TextFieldWrapper>
        </TextfieldContainer>,
        <Items closeOnClick key="items">
          {tokensList?.map((item, index) => (
            <DropdownBridgeItem
              key={index}
              onClick={() => {
                setValue('')
                onSelectToken(item)
              }}
            >
              <TokenIcon dimensions={32} iconSource={item.logoURI} symbol={item.symbol} />
              <TokenInfo>
                <strong>{item.name}</strong>
                {item.symbol}
              </TokenInfo>
            </DropdownBridgeItem>
          ))}
        </Items>,
        tokensList?.length === 0 ? <NoResults closeOnClick={false}>Not found.</NoResults> : <></>,
      ]}
      onClose={() => setIsOpened(false)}
      {...restProps}
    />
  )
}

export const TokenDropdown: React.FC<Props> = ({ ...restProps }) => {
  return (
    <TokenListProvider>
      <Dropdown {...restProps} />
    </TokenListProvider>
  )
}
