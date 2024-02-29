import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

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

  // Get the top tokens (Mainnet / Gnosis Chain)
  // ETH / DAI / XDAI / WETH / GNO / USDC / USDT / WBTC / OLAS / HOPR
  useEffect(() => {
    const topTokenAddresses = [
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
      '0x6810e776880c02933d47db1b9fc05908e5386b96',
      '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
      '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
      '0x0001a500a6b18995b03f44bb040a5ffc28e45cb0',
      '0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f',
      '0xf5581dfefd8fb0e4aec526be659cfab1f8c781da',
      '0xd057604a14982fe8d88c5fc25aac3267ea142a08',
    ]
    const allTokens = ambTokensByNetwork[fromChainId]
      .concat(manualTokens.filter((item) => item.chainId === fromChainId))
      .filter((item) => item.address !== ZERO_ADDRESS)

    const _topTokens = allTokens?.filter((item) => {
      return topTokenAddresses.includes(item.address) || item.name.toLowerCase() === 'eth'
    })

    setTopTokens(_topTokens)
  }, [ambTokensByNetwork, fromChainId, manualTokens])

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
        </TopTokens>,
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
