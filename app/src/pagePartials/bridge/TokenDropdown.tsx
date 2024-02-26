import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { JsonRpcBatchProvider } from '@ethersproject/providers'

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
import { ERC165__factory, HomeOmniMediator__factory } from '@/types/typechain'
import { contracts } from '@/src/constants/config/contracts'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { isSameString } from '@/src/utils/tools'
import { Spinner } from '@/src/components/loading/Spinner'

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
  const [allTokens, setAllTokens] = useState(ambTokensByNetwork[fromChainId])
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredTokens = orderBy(
    value
      ? allTokens?.filter((item) =>
          isAddress(value)
            ? isSameString(item.address, value)
            : item.symbol.toLowerCase().includes(value.toLowerCase()),
        )
      : allTokens,
    ['symbol', 'name'],
  )

  const onSelectToken = (token: Token) => {
    if (typeof onChange !== 'undefined') onChange(token)
  }

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

          setAllTokens((_allTokens) => [
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
            ...(_allTokens || []),
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
          <ButtonText>
            {defaultToken ? defaultToken.symbol : <small>Select token...</small>}
          </ButtonText>
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
