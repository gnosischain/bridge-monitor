import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { DebounceInput } from 'react-debounce-input'
import { type Address, erc20Abi, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'

import { ChevronDown as BaseChevronDown } from '@/src/components/assets/ChevronDown'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { Dropdown as BaseDropdown, DropdownPosition } from '@/src/components/dropdown'
import { TextfieldCSS, TextfieldCSSProps, TextfieldProps } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { getToChainId } from '@/src/utils/tools'
import { contracts } from '@/src/constants/config/contracts'

const Wrapper = styled(BaseDropdown)`
  --inner-padding: calc(var(--theme-common-space) / 2);

  .dropdownItems {
    max-height: 300px;
    max-width: 250px;
    overflow: auto;
  }

  &[disabled] {
    opacity: 1;
  }
`

const TextfieldContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  padding: calc(var(--theme-common-space) / 2) calc(var(--theme-common-space) / 2) 0;
  position: sticky;
  top: 0;
  z-index: 1;
`

const TextFieldWrapper = styled.div`
  position: relative;
`

// const Textfield: any = styled(DebounceInput)`
const Textfield = styled(DebounceInput).attrs<TextfieldProps>(() => ({
  element: 'input',
}))<TextfieldCSSProps>`
  --texfield-font-size: 1.4rem;

  ${TextfieldCSS};

  border-radius: 4px;
  flex-shrink: 0;
  height: 42px;
  max-width: 100%;
  padding: 0 10px 0 38px;
  width: auto;
`

const Magnifier = styled(BaseMagnifier)`
  left: 10px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`

const Info = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.3rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  padding: var(--theme-common-space) calc(var(--theme-common-space) / 2);
  white-space: normal;
`

const Items = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  padding: 0 calc(var(--theme-common-space) / 2) calc(var(--theme-common-space) / 2);
`

const DropdownItem = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  color: ${({ theme: { dropdown } }) => dropdown.item.color};
  column-gap: calc(var(--theme-common-space) / 4);
  cursor: pointer;
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.4;
  min-height: 34px;
  overflow: hidden;
  padding: 0 cvar(--inner-padding);
  text-decoration: none;
  transition: background-color 0.15s linear;
  user-select: none;
  white-space: normal;

  &:hover {
    background-color: ${({ theme: { dropdown } }) => dropdown.item.backgroundColorHover};
  }

  &:first-child {
    border-top: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  }

  &:last-child {
    border-bottom: none;
  }
`

const NoResults = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
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
  background: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 6px;
  border: none;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: var(--theme-common-space);
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
  const [token, setToken] = useState<Token | undefined>(defaultToken)
  const { ambTokensByNetwork } = useBridgedTokens()
  const tokens = useMemo(() => {
    if (([Chains.mainnet, Chains.gnosis] as Array<number>).includes(chainId)) {
      return ambTokensByNetwork[chainId] ?? []
    }
  }, [chainId, ambTokensByNetwork])

  const [value, setValue] = useState('')

  const onSelectToken = (token: Token) => {
    setToken(token)
    if (typeof onChange !== 'undefined') onChange(token)
  }

  useEffect(() => {
    if (defaultToken && defaultToken.address.toLowerCase() !== token?.address.toLowerCase()) {
      setToken(defaultToken)
    }
  }, [defaultToken, token?.address])

  // The list of known tokens matching the current search
  const filteredTokens = useMemo(() => {
    if (value.length === 0) return tokens
    if (isAddress(value)) {
      return tokens?.filter(
        (item) => item.address.toLowerCase().indexOf(value.toLowerCase()) !== -1,
      )
    }
    return tokens?.filter((item) => item.symbol.toLowerCase().indexOf(value.toLowerCase()) !== -1)
  }, [tokens, value])

  // If the search value is an address with no known match, look the token up
  // on-chain. useReadContracts batches the reads into a single Multicall3 call
  // per chain, and query.enabled gates it to the "address, no match" case.
  const isFromGnosis = chainId === Chains.gnosis
  const { data: onChainToken, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { chainId, address: value as Address, abi: erc20Abi, functionName: 'name' },
      { chainId, address: value as Address, abi: erc20Abi, functionName: 'symbol' },
      { chainId, address: value as Address, abi: erc20Abi, functionName: 'decimals' },
      {
        chainId: Chains.gnosis,
        address: contracts.OmniBridge.address[Chains.gnosis] as Address,
        abi: contracts.OmniBridge.abi,
        functionName: isFromGnosis ? 'foreignTokenAddress' : 'homeTokenAddress',
        args: [value as Address],
      },
    ],
    query: {
      enabled: Boolean(value && isAddress(value) && !filteredTokens?.length),
      retry: false,
    },
  })

  // Derive the resolved token from the on-chain read — no state, no effect.
  const manualToken = useMemo<Token | null>(() => {
    if (!onChainToken) return null

    const [name, symbol, decimals, bridgeAddress] = onChainToken
    if (!name || !symbol || !bridgeAddress) return null

    return {
      chainId,
      address: value,
      decimals,
      logoURI: '',
      name,
      symbol,
      extensions: {
        bridgeInfo: {
          [getToChainId(chainId)]: {
            tokenAddress: bridgeAddress,
          },
          [chainId]: {
            tokenAddress: value,
          },
        },
      },
    }
  }, [onChainToken, chainId, value])

  const displayedTokens = manualToken ? [manualToken, ...(filteredTokens ?? [])] : filteredTokens

  return (
    <Wrapper
      disabled={disabled}
      dropdownButton={
        <Button type="button">
          {token && <TokenIcon dimensions={18} iconSource={token.logoURI} symbol={token.symbol} />}
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
              autoComplete="off"
              autoCorrect="off"
              debounceTimeout={300}
              onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
              placeholder="Search asset"
              spellCheck="false"
              type="search"
              value={value}
            />
          </TextFieldWrapper>
          <Info>Search among hundreds of available tokens</Info>
        </TextfieldContainer>,
        <Items closeOnClick key="items">
          {isLoading && <NoResults closeOnClick={false}>Loading...</NoResults>}
          {displayedTokens?.map((item, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                onSelectToken(item)
              }}
            >
              <TokenIcon dimensions={18} iconSource={item.logoURI} symbol={item.symbol} />
              {item.symbol}
            </DropdownItem>
          ))}
        </Items>,
        displayedTokens?.length === 0 && !isLoading ? (
          <NoResults closeOnClick={false}>Not found.</NoResults>
        ) : (
          <></>
        ),
      ]}
      {...restProps}
    />
  )
}

export const TokenDropdown: React.FC<Props> = ({ ...restProps }) => {
  return <Dropdown {...restProps} />
}
