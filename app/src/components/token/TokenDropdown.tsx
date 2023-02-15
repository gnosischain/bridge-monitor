import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { DebounceInput } from 'react-debounce-input'

import { ChevronDown as BaseChevronDown } from '@/src/components/assets/ChevronDown'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { Dropdown, DropdownPosition } from '@/src/components/common/Dropdown'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Token } from '@/src/constants/token'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'

const Wrapper = styled(Dropdown)`
  --inner-padding: 4px;

  .dropdownItems {
    max-height: 300px;
    max-width: 175px;
    overflow: auto;
  }

  &[disabled] {
    opacity: 1;
  }
`

const TextfieldContainer = styled.div<{ closeOnClick?: boolean }>`
  background: ${({ theme: { colors } }) => colors.lightGrey};
  padding: calc(var(--inner-padding) * 2) var(--inner-padding) 0;
  position: sticky;
  top: 0;
  z-index: 1;
`

const TextFieldWrapper = styled.div`
  position: relative;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Textfield: any = styled(DebounceInput)`
  --texfield-font-size: 1.4rem;

  ${TextfieldCSS}

  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  border-radius: 4px;
  color: ${({ theme: { colors } }) => colors.cream};
  flex-shrink: 0;
  height: 44px;
  max-width: 100%;
  padding: 0 10px 0 38px;
  width: auto;

  &::placeholder {
    color: ${({ theme: { colors } }) => colors.cream};
    opacity: 0.8;
  }
`

const Magnifier = styled(BaseMagnifier)`
  left: 10px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`

const Info = styled.p`
  color: #fff;
  font-size: 1.2rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  padding: calc(var(--inner-padding) * 2) var(--inner-padding) 0;
  white-space: normal;
`

const Items = styled.div<{ closeOnClick?: boolean }>`
  background: ${({ theme }) => theme.dropdown.background};
  padding: 0 var(--inner-padding) var(--inner-padding);
`

const DropdownItem = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.darkGrey};
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: 4px;
  cursor: pointer;
  display: flex;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.4;
  min-height: 34px;
  overflow: hidden;
  padding: 0 8px;
  text-decoration: none;
  transition: background-color 0.15s linear;
  user-select: none;
  white-space: normal;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`

const NoResults = styled.div<{ closeOnClick?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.textColor};
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  height: 80px;
  justify-content: center;
  line-height: 1.2;
  padding: var(--inner-padding);
`

const Button = styled.button`
  align-items: center;
  background: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 6px;
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;
  display: flex;
  font-size: 1.2rem;
  height: 34px;
  justify-content: space-between;
  line-height: 1.2;
  margin: 0;
  padding: 0 8px;
  text-transform: uppercase;
`

const ButtonText = styled.span`
  margin-left: 4px;
  margin-right: auto;
`

const ChevronDown = styled(BaseChevronDown)`
  margin-left: 20px;
`

export const TokenDropdown: React.FC<{
  onChange?: (token: Token | null) => void
  defaultToken?: Token
  disabled?: boolean
}> = ({ defaultToken, disabled = false, onChange, ...restProps }) => {
  const [token, setToken] = useState<Token | null>(defaultToken ? defaultToken : null)
  const { tokens } = useTokenIcons()
  const [tokensList, setTokensList] = useState(tokens)
  const [value, setValue] = useState('')

  const onSelectToken = (token: Token | null) => {
    setToken(token)

    if (typeof onChange !== 'undefined') {
      onChange(token)
    }
  }

  useEffect(() => {
    if (value.length === 0) {
      setTokensList(tokens)
    } else {
      setTokensList(
        tokens.filter((item) => item.symbol.toLowerCase().indexOf(value.toLowerCase()) !== -1),
      )
    }
  }, [tokens, value])

  return (
    <Wrapper
      disabled={disabled}
      dropdownButton={
        <Button>
          {token && <TokenIcon dimensions={18} symbol={token.symbol} />}
          <ButtonText>{token ? token.symbol : 'Select token...'}</ButtonText>
          {!disabled && <ChevronDown />}
        </Button>
      }
      dropdownPosition={DropdownPosition.right}
      items={[
        <TextfieldContainer closeOnClick={false} key="tokenSearchInput">
          <TextFieldWrapper>
            <Magnifier />
            <Textfield
              debounceTimeout={300}
              onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
              placeholder="Search asset"
              type="search"
              value={value}
            />
          </TextFieldWrapper>
          <Info>Search among hundreds of available tokens</Info>
        </TextfieldContainer>,
        <Items closeOnClick key="items">
          {tokensList.map((item, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                onSelectToken(item)
              }}
            >
              <TokenIcon dimensions={18} symbol={item.symbol} />
              {item.symbol}
            </DropdownItem>
          ))}
        </Items>,
        tokensList.length === 0 ? <NoResults closeOnClick={false}>Not found.</NoResults> : <></>,
      ]}
      {...restProps}
    />
  )
}

export default TokenDropdown
