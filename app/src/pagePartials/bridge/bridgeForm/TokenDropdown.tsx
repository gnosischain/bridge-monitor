import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import get from 'lodash/get'
import { formatUnits, isAddress } from 'viem'
import { DebounceInput } from 'react-debounce-input'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { Dropdown as BaseDropdown, DropdownItem, DropdownPosition } from '@/src/components/dropdown'
import { TextfieldCSS, TextfieldCSSProps, TextfieldProps } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import orderBy from 'lodash/orderBy'
import { HomeOmniMediator__factory } from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { isSameString } from '@/src/utils/tools'
import { Spinner } from '@/src/components/loading/Spinner'
import { ERC165__factory } from '@/types/typechain/factories/ERC165__factory'
import { USDCe_GNOSIS, ZERO_ADDRESS } from '@/src/constants/misc'
import { useUserTokenListBalances } from '@/src/hooks/bridge/useUserTokenListBalances'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { usdsToken } from '@/src/constants/usdsToken'
import { xdaiToken } from '@/src/constants/xdaiToken'

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
      fill="#3E6957"
    />
  </svg>
)

const Wrapper = styled(BaseDropdown)`
  --inner-padding: calc(var(--theme-common-space) * 2);

  flex-shrink: 0;

  .dropdownItems {
    max-height: 350px;
    overflow: auto;
    width: 300px;

    @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      width: 440px;
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
  padding: calc(var(--theme-common-space) * 2);
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

const Items = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  background-color: ${({ theme: { dropdown } }) => dropdown.background};
  padding: 0 0 calc(var(--theme-common-space) / 2);
`

const DropdownBridgeItem = styled(DropdownItem)`
  --inner-padding: calc(var(--theme-common-space) * 2);

  &:first-child {
    border-radius: 0;
  }

  padding: var(--inner-padding);
`

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: normal;
  flex: 1;

  strong {
    font-size: 1.8rem;
    font-weight: 500;
  }
`

const TokenAmount = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
`

const NoResults = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
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
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: none;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: var(--theme-common-space);
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  height: 34px;
  justify-content: start;
  line-height: 1.2;
  margin: 0;
  min-height: 100%;
  min-width: 130px;
  padding: 0 var(--theme-common-space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
  }
`

const ButtonText = styled.span``

const ChevronDown = styled(BaseChevronDown)`
  margin-left: auto;

  .fill {
    fill: ${({ theme: { colors } }) => colors.primary};
  }
`

const TopTokens = styled.div.withConfig({
  shouldForwardProp: (prop) => !['closeOnClick'].includes(prop),
})<{ closeOnClick?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme: { colors } }) => colors.cream};
  column-gap: calc(var(--theme-common-space) / 2);
  display: flex;
  flex-wrap: wrap;
  padding: 0 var(--inner-padding) var(--inner-padding) var(--inner-padding);
  row-gap: var(--theme-common-space);
`

const TopToken = styled.button`
  --top-token-height: 32px;

  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: calc(var(--top-token-height) - 10px);
  border: none;
  column-gap: calc(var(--theme-common-space) / 2);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: ${({ theme: { fonts } }) => fonts.fontFamily};
  height: var(--top-token-height);
  padding: 0 var(--theme-common-space) 0 calc(var(--theme-common-space) / 2);
  transition: none;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.creamDarker};
  }

  &:active {
    opacity: 0.7;
  }
`

TopToken.defaultProps = {
  type: 'button',
}

const TopTokenName = styled.span`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.4rem;
  font-weight: 500;
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

  // const searchInputRef = useRef<HTMLInputElement | null>(null)
  const { ambTokensByNetwork } = useBridgedTokens()
  const [manualTokens, setManualTokens] = useState<Token[]>([])
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [topTokens, setTopTokens] = useState<Token[]>([])
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { address } = useWeb3Connection()
  const { data: balances } = useUserTokenListBalances({
    userAddress: address,
    chainId: fromChainId,
  })

  const onSelectToken = (token: Token) => {
    if (typeof onChange !== 'undefined') onChange(token)
  }

  // When the chain changes, we update the tokens list
  useEffect(() => {
    const allTokens = ambTokensByNetwork[fromChainId]
      .concat(manualTokens.filter((item) => item.chainId === fromChainId))
      .filter((item) => {
        if (isSameString(item.address, ZERO_ADDRESS)) return false
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
                logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png?1696506694',
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
      .concat(fromChainId === Chains.mainnet ? [usdsToken] : [])

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
        const aHasBalance = balances[a.address]
        const bHasBalance = balances[b.address]

        if (aHasBalance && !bHasBalance) {
          return -1
        } else if (!aHasBalance && bHasBalance) {
          return 1
        } else {
          return 0
        }
      })
    }

    setFilteredTokens(_filteredTokens)
  }, [ambTokensByNetwork, fromChainId, manualTokens, value, balances])

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

  // if the value is an address and there is not token match
  // we try a search on-chain.
  useEffect(() => {
    if (value && isAddress(value.toLowerCase()) && !filteredTokens.length) {
      setIsLoading(true)

      const isFromGnosis = fromChainId == Chains.gnosis
      const erc20 = ERC165__factory.connect(
        value,
        new JsonRpcBatchProvider(getNetworkConfig(fromChainId)?.rpcUrl),
      )
      const omni = HomeOmniMediator__factory.connect(
        contracts.OmniBridge.address[Chains.gnosis],
        new JsonRpcBatchProvider(getNetworkConfig(Chains.gnosis)?.rpcUrl),
      )

      Promise.all([
        erc20.name(),
        erc20.symbol(),
        erc20.decimals(),
        isFromGnosis ? omni.foreignTokenAddress(value) : omni.homeTokenAddress(value),
      ])
        .then(([name, symbol, decimals, _address]) => {
          if (!name || !symbol || !decimals || !_address) return

          setManualTokens((_manualTokens) => [
            {
              chainId: fromChainId,
              address: value,
              decimals,
              logoURI: '',
              name,
              symbol,
              extensions: {
                bridgeInfo: {
                  [toChainId]: {
                    tokenAddress: _address,
                  },
                },
              },
            },
            ...(_manualTokens || []),
          ])
        })
        .catch(() => {
          // console.error('Failed to fetch token data:', error)
          return
        })
        .finally(() => setIsLoading(false))
    }
  }, [filteredTokens.length, fromChainId, toChainId, value])

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
        <Button onClick={() => setIsOpened(!isOpened)} type="button">
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
      dropdownPosition={DropdownPosition.left}
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
        ) : filteredTokens.length ? (
          <Items closeOnClick key="items">
            {filteredTokens?.map((item, index) => (
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
                {balances && balances[item.address] && (
                  <TokenAmount>
                    {formatUnits(balances[item.address], item?.decimals ?? 18)}
                  </TokenAmount>
                )}
              </DropdownBridgeItem>
            ))}
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
