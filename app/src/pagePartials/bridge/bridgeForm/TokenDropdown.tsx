import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import get from 'lodash/get'
import { DebounceInput } from 'react-debounce-input'
import { useReadContracts } from 'wagmi'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { Dropdown as BaseDropdown, DropdownItem, DropdownPosition } from '@/src/components/dropdown'
import { TextfieldCSS, TextfieldCSSProps, TextfieldProps } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import orderBy from 'lodash/orderBy'
import { contracts } from '@/src/constants/config/contracts'
import { isSameString } from '@/src/utils/tools'
import { Spinner } from '@/src/components/loading/Spinner'
import { USDCe_GNOSIS } from '@/src/constants/misc'
import { useUserTokenListBalances } from '@/src/hooks/bridge/useUserTokenListBalances'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { formatNumber } from '@/src/utils/format'
import { usdsToken } from '@/src/constants/usdsToken'
import { xdaiToken } from '@/src/constants/xdaiToken'
import { type Address, erc20Abi, formatUnits, isAddress, zeroAddress } from 'viem'

const BaseChevronDown = ({ ...restProps }) => (
  <svg
    fill="none"
    height="7"
    viewBox="0 0 12 7"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      d="M11.2654 1.26492L6.26541 6.26492C6.1951 6.33515 6.09979 6.37459 6.00041 6.37459C5.90104 6.37459 5.80572 6.33515 5.73541 6.26492L0.735411 1.26492C0.669171 1.19384 0.63311 1.09981 0.634824 1.00266C0.636538 0.905512 0.675894 0.812819 0.744601 0.744113C0.813307 0.675406 0.906 0.63605 1.00315 0.634336C1.1003 0.632622 1.19432 0.668684 1.26541 0.734924L6.00041 5.4693L10.7354 0.734924C10.8065 0.668684 10.9005 0.632622 10.9977 0.634336C11.0948 0.63605 11.1875 0.675406 11.2562 0.744113C11.3249 0.812819 11.3643 0.905512 11.366 1.00266C11.3677 1.09981 11.3317 1.19384 11.2654 1.26492Z"
      fill="currentColor"
    />
  </svg>
)

const Wrapper = styled(BaseDropdown)`
  --inner-padding: calc(var(--theme-common-space) * 1.5);

  flex-shrink: 0;

  .dropdownItems {
    border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
    max-height: 380px;
    overflow: auto;
    width: 300px;

    @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      width: 400px;
    }
  }

  &[disabled] {
    opacity: 1;
  }
`

const TextfieldContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  padding: var(--inner-padding);
  position: sticky;
  top: 0;
  z-index: 1;
`

const TextFieldWrapper = styled.div`
  position: relative;
`

const Textfield = styled(DebounceInput).attrs<TextfieldProps>(() => ({
  element: 'input',
}))<TextfieldCSSProps>`
  --texfield-font-size: 1.6rem;

  ${TextfieldCSS};

  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  padding: 0 var(--theme-common-space) 0 calc(var(--theme-common-space) * 5);
  flex-shrink: 0;
  height: 44px;
  max-width: 100%;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: 0 calc(var(--theme-common-space) * 2) 0 calc(var(--theme-common-space) * 5);
  }
`

const Magnifier = styled(BaseMagnifier)`
  left: 14px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`

const Items = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) / 2) var(--theme-common-space) var(--theme-common-space);
  row-gap: 2px;
`

const DropdownBridgeItem = styled(DropdownItem)`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 1.5);

  &:first-child,
  &:last-child {
    border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  }
`

const TokenInfo = styled.div`
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.3;
  flex: 1;
  min-width: 0;

  strong {
    color: ${({ theme: { colors } }) => colors.ink};
    font-size: 1.5rem;
    font-weight: 500;
  }
`

const TokenAmount = styled.div`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.5rem;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
`

const NoResults = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  font-size: 1.5rem;
  font-weight: 500;
  height: 80px;
  justify-content: center;
  line-height: 1.2;
  padding: var(--inner-padding);
`

const Button = styled.button<{ $isEmpty: boolean }>`
  align-items: center;
  background-color: ${({ $isEmpty, theme: { colors } }) =>
    $isEmpty ? colors.ink : colors.surface};
  border-radius: 999px;
  border: 1px solid ${({ $isEmpty, theme: { colors } }) => ($isEmpty ? colors.ink : colors.line)};
  color: ${({ $isEmpty, theme: { colors } }) => ($isEmpty ? colors.surface : colors.ink)};
  column-gap: var(--theme-common-space);
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.5rem;
  font-weight: 600;
  height: 40px;
  line-height: 1.2;
  margin: 0;
  padding: ${({ $isEmpty }) => ($isEmpty ? '0 14px' : '0 12px 0 6px')};
  white-space: nowrap;

  &:hover {
    background-color: ${({ $isEmpty, theme: { colors } }) =>
      $isEmpty ? colors.inkHover : colors.surface};
    border-color: ${({ $isEmpty, theme: { colors } }) =>
      $isEmpty ? colors.inkHover : colors.faint};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
  }
`

const ButtonText = styled.span``

const ChevronDown = styled(BaseChevronDown)`
  margin-left: 2px;
`

const TopTokens = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.line};
  column-gap: 6px;
  display: flex;
  flex-wrap: wrap;
  padding: 0 var(--inner-padding) var(--inner-padding) var(--inner-padding);
  row-gap: 6px;
`

const TopToken = styled.button`
  --top-token-height: 32px;

  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: 999px;
  border: none;
  column-gap: calc(var(--theme-common-space) / 2);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  height: var(--top-token-height);
  padding: 0 var(--theme-common-space) 0 calc(var(--theme-common-space) / 2);
  transition: none;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }

  &:active {
    opacity: 0.7;
  }
`

TopToken.defaultProps = {
  type: 'button',
}

const TopTokenName = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1;
  overflow: hidden;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
`

const Loading = styled.div`
  align-items: center;
  display: flex;
  height: 175px;
  justify-content: center;
  width: 100%;
`

interface Props {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  defaultToken?: Token
  disabled?: boolean
  onChange?: (token: Token) => void
}

const Dropdown: React.FC<Props> = ({
  defaultToken,
  disabled = false,
  fromChainId,
  onChange,
  toChainId,
  ...restProps
}) => {
  const [isOpened, setIsOpened] = useState(false)
  const [searchInputRef, setSearchInputInputRef] = useState<HTMLInputElement | null>(null)

  const { ambTokensByNetwork } = useBridgedTokens()
  const [topTokens, setTopTokens] = useState<Token[]>([])
  const [value, setValue] = useState('')

  const { address } = useWeb3Connection()

  const onSelectToken = (token: Token) => {
    if (typeof onChange !== 'undefined') onChange(token)
  }

  // Every token selectable from this chain
  const allTokens = useMemo(
    () =>
      ambTokensByNetwork[fromChainId]
        .filter((item) => {
          if (isSameString(item.address, zeroAddress)) return false
          if (fromChainId === Chains.gnosis && isSameString(item.symbol, 'USDS')) return false
          return true
        })
        .concat(
          fromChainId === Chains.gnosis
            ? [
                {
                  address: USDCe_GNOSIS,
                  chainId: 100,
                  decimals: 6,
                  logoURI:
                    'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
                  name: 'USDC.e',
                  symbol: 'USDC.e',
                  extensions: {
                    bridgeInfo: {
                      '1': {
                        tokenAddress: '',
                      },
                    },
                  },
                } as Token,
              ]
            : [],
        )
        .concat(fromChainId === Chains.mainnet ? [usdsToken] : []),
    [ambTokensByNetwork, fromChainId],
  )

  const tokenAddresses = useMemo(() => allTokens.map((item) => item.address), [allTokens])

  const { data: balances } = useUserTokenListBalances({
    chainId: fromChainId,
    enabled: isOpened,
    tokenAddresses,
    userAddress: address,
  })

  const getBalance = (token: Token) => balances?.[token.address.toLowerCase()]

  // The list of known tokens matching the current search
  const filteredTokens = useMemo(() => {
    const _filteredTokens = orderBy(
      value
        ? allTokens?.filter((item) =>
            isAddress(value)
              ? isSameString(item.address, value)
              : item.symbol.toLowerCase().includes(value.toLowerCase()),
          )
        : allTokens,
      ['symbol', 'name'],
    )

    if (balances) {
      _filteredTokens.sort((a, b) => {
        const aHasBalance = balances[a.address.toLowerCase()]
        const bHasBalance = balances[b.address.toLowerCase()]

        if (aHasBalance && !bHasBalance) {
          return -1
        } else if (!aHasBalance && bHasBalance) {
          return 1
        } else {
          return 0
        }
      })
    }

    return _filteredTokens
  }, [allTokens, value, balances])

  useEffect(() => {
    // Define the symbols array with the desired order
    const _tokens = [
      { symbol: 'DAI', address: '0x44fA8E6f47987339850636F88629646662444217' },
      { symbol: 'GNO', address: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb' },
      { symbol: 'WSTETH', address: '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6' },
      { symbol: 'WETH', address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1' },
      { symbol: 'WBTC', address: '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252' },
      { symbol: 'USDC', address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83' },
      { symbol: 'COW', address: '0x177127622c4A00F3d409B75571e12cB3c8973d3c' },
      { symbol: 'USDT', address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6' },
      { symbol: 'OLAS', address: '0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f' },
      { symbol: 'HOPR', address: '0xD057604A14982FE8D88c5fC25Aac3267eA142a08' },
    ].filter((item) => (fromChainId == Chains.mainnet ? true : item.symbol !== 'DAI'))

    const symbols = ['XDAI', 'DAI', 'ETH', ..._tokens.map((item) => item.symbol)]
    const isFromHome = fromChainId == Chains.gnosis
    const key = isFromHome ? 'address' : `extensions.bridgeInfo.${toChainId}.tokenAddress`
    const tokensByChain = ambTokensByNetwork[fromChainId]

    // Get the tokens from the ambTokensByNetwork and the native token
    // based on the _tokens array
    const filteredTokens = Object.values(_tokens)
      .map((_t) => tokensByChain.find((token) => isSameString(get(token, key), _t.address)))
      .filter((token): token is Token => !!token)

    // Sort the filtered tokens according to their position in the _tokens array
    const orderedTokens = [
      ...(fromChainId === Chains.gnosis ? [xdaiToken] : []),
      ...(fromChainId === Chains.mainnet ? [usdsToken] : []),
      ...filteredTokens
        .sort(
          (a, b) =>
            symbols.indexOf(a.symbol.toUpperCase()) - symbols.indexOf(b.symbol.toUpperCase()),
        )
        .slice(0, 10),
    ]

    setTopTokens(orderedTokens)
  }, [ambTokensByNetwork, fromChainId, toChainId])

  // If the search value is an address with no known match, look the token up
  // on-chain. useReadContracts batches the reads into a single Multicall3 call
  // per chain, and query.enabled gates it to the "address, no match" case.
  const isFromGnosis = fromChainId === Chains.gnosis
  const { data: onChainToken, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { chainId: fromChainId, address: value as Address, abi: erc20Abi, functionName: 'name' },
      { chainId: fromChainId, address: value as Address, abi: erc20Abi, functionName: 'symbol' },
      { chainId: fromChainId, address: value as Address, abi: erc20Abi, functionName: 'decimals' },
      {
        chainId: Chains.gnosis,
        address: contracts.OmniBridge.address[Chains.gnosis] as Address,
        abi: contracts.OmniBridge.abi,
        functionName: isFromGnosis ? 'foreignTokenAddress' : 'homeTokenAddress',
        args: [value as Address],
      },
    ],
    query: {
      enabled: Boolean(value && isAddress(value) && !filteredTokens.length),
      retry: false,
    },
  })

  // Derive the resolved token from the on-chain read — no state, no effect.
  const manualToken = useMemo<Token | null>(() => {
    if (!onChainToken) return null

    const [name, symbol, decimals, bridgeAddress] = onChainToken
    if (!name || !symbol || !bridgeAddress) return null

    return {
      chainId: fromChainId,
      address: value,
      decimals,
      logoURI: '',
      name,
      symbol,
      extensions: {
        bridgeInfo: {
          [toChainId]: {
            tokenAddress: bridgeAddress,
          },
        },
      },
    }
  }, [onChainToken, fromChainId, toChainId, value])

  const displayedTokens = manualToken ? [manualToken, ...filteredTokens] : filteredTokens

  // Focus the search input when the dropdown is opened
  useEffect(() => {
    if (isOpened && searchInputRef) {
      searchInputRef.focus()
    }
  }, [searchInputRef, isOpened])

  return (
    <Wrapper
      disabled={disabled}
      dropdownButton={
        <Button $isEmpty={!defaultToken} onClick={() => setIsOpened(!isOpened)} type="button">
          {defaultToken && (
            <TokenIcon
              dimensions={24}
              iconSource={defaultToken.logoURI}
              symbol={defaultToken.symbol}
            />
          )}
          <ButtonText>{defaultToken ? defaultToken.symbol : <>Select token</>}</ButtonText>
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
              // eslint-disable-next-line
              // @ts-ignore
              inputRef={setSearchInputInputRef}
              onChange={(e) => {
                const target = e.target as unknown as HTMLInputElement
                setValue(target.value)
              }}
              placeholder="Search asset"
              spellCheck="false"
              type="search"
              value={value}
            />
          </TextFieldWrapper>
        </TextfieldContainer>,
        value.length ? (
          <></>
        ) : (
          <TopTokens closeOnClick key="topTokens">
            {topTokens.map((item, index) => (
              <TopToken
                key={index}
                onClick={() => {
                  setValue('')
                  onSelectToken(item)
                }}
              >
                <TokenIcon dimensions={22} iconSource={item.logoURI} symbol={item.symbol} />
                <TopTokenName>{item.symbol}</TopTokenName>
              </TopToken>
            ))}
          </TopTokens>
        ),
        isLoading ? (
          <Loading>
            <Spinner />
          </Loading>
        ) : displayedTokens.length ? (
          <Items closeOnClick key="items">
            {displayedTokens?.map((item, index) => {
              const balance = getBalance(item)

              return (
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
                  {balance !== undefined && (
                    <TokenAmount>
                      {formatNumber(Number(formatUnits(balance, item.decimals)))}
                    </TokenAmount>
                  )}
                </DropdownBridgeItem>
              )
            })}
          </Items>
        ) : (
          <NoResults closeOnClick={false}>Not found.</NoResults>
        ),
      ]}
      onClose={() => setIsOpened(false)}
      {...restProps}
    />
  )
}

export const TokenDropdown: React.FC<Props> = ({ ...restProps }) => {
  return <Dropdown {...restProps} />
}
