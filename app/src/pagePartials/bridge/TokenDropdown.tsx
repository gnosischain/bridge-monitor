import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { JsonRpcBatchProvider } from '@ethersproject/providers'
import get from 'lodash/get'
import { isAddress } from '@ethersproject/address'
import { DebounceInput } from 'react-debounce-input'

import { ChevronDown as BaseChevronDown } from '@/src/components/assets/ChevronDown'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { Dropdown as BaseDropdown, DropdownItem, DropdownPosition } from '@/src/components/dropdown'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { Token } from '@/types/token'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import dynamic from 'next/dynamic'
import orderBy from 'lodash/orderBy'
import { HomeOmniMediator__factory } from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { isSameString } from '@/src/utils/tools'
import { Spinner } from '@/src/components/loading/Spinner'
import { ERC165__factory } from '@/types/typechain/factories/ERC165__factory'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'

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
  justify-content: start;
  line-height: 1.2;
  margin: 0;
  min-height: 100%;
  min-width: 130px;
  padding: 0 calc(var(--theme-common-space) * 2);

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

const TopTokens = styled.div<{ closeOnClick?: boolean }>`
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
  const [manualTokens, setManualTokens] = useState<Token[]>([])
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [topTokens, setTopTokens] = useState<Token[]>([])
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onSelectToken = (token: Token) => {
    if (typeof onChange !== 'undefined') onChange(token)
  }

  // When the chain changes, we update the tokens list
  useEffect(() => {
    const allTokens = ambTokensByNetwork[fromChainId]
      .concat(manualTokens.filter((item) => item.chainId === fromChainId))
      .filter((item) => item.address !== ZERO_ADDRESS)

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

    setFilteredTokens(_filteredTokens)
  }, [ambTokensByNetwork, fromChainId, manualTokens, value])

  useEffect(() => {
    // Define the symbols array with the desired order
    const _tokens = [
      { symbol: 'GNO', address: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb' },
      { symbol: 'WSTETH', address: '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6' },
      { symbol: 'WETH', address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1' },
      { symbol: 'WBTC', address: '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252' },
      { symbol: 'USDC', address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83' },
      { symbol: 'COW', address: '0x177127622c4A00F3d409B75571e12cB3c8973d3c' },
      { symbol: 'USDT', address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6' },
      { symbol: 'OLAS', address: '0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f' },
      { symbol: 'HOPR', address: '0xD057604A14982FE8D88c5fC25Aac3267eA142a08' },
    ]

    const symbols = ['ETH', 'XDAI', ..._tokens.map((item) => item.symbol)]
    const isFromHome = fromChainId == Chains.gnosis
    const key = isFromHome ? 'address' : `extensions.bridgeInfo.${toChainId}.tokenAddress`
    const tokensByChain = ambTokensByNetwork[fromChainId]

    // Filter the tokens based on the desired symbols array
    const filteredTokens = Object.values(_tokens)
      .map((token) => tokensByChain.find((item) => isSameString(get(item, key), token.address)))
      .filter((item): item is Token => !!item)
      .concat(
        tokensByChain.find((item) => isSameString(item.address, NATIVE_TOKEN_ADDRESS)) as Token,
      )

    // Sort the filtered tokens according to their position in the _tokens array
    const orderedTokens = filteredTokens.sort(
      (a, b) => symbols.indexOf(a.symbol.toUpperCase()) - symbols.indexOf(b.symbol.toUpperCase()),
    )

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
              debounceTimeout={300}
              inputRef={setSearchInputInputRef}
              onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
              placeholder="Search asset"
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
          <Spinner />
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
  return (
    <TokenListProvider>
      <Dropdown {...restProps} />
    </TokenListProvider>
  )
}
