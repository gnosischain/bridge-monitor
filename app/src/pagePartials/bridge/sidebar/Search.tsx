import styled from 'styled-components'
import { bridgeExplorerBaseURL, myTransactionsFullURL } from '@/src/constants/sections'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { DebounceInput } from 'react-debounce-input'
import { TextfieldCSS, TextfieldCSSProps, TextfieldProps } from '@/src/components/form/Textfield'
import { DEBOUNCE_TIME } from '@/src/constants/misc'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { MyTransactions } from '@/src/components/assets/MyTransactions'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SCLink, SCText, SCTitle, SidebarCard } from '@/src/components/card/SidebarCard'
import Link from 'next/link'
import { isTransactionHash } from '@/src/utils/tools'
import { isAddress } from 'ethers/lib/utils'
import { isValidDomainName } from '@/src/utils/isValidDomainName'

const Wrapper = styled(SidebarCard)`
  padding-top: calc(var(--theme-common-space) * 5);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 8);
  }
`

const SearchWrapper = styled.div`
  --border-radius: 8px;

  border-radius: var(--border-radius);
  margin: 0 0 calc(var(--theme-common-space) * 3);
  position: relative;
  width: 100%;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const Textfield: any = styled(DebounceInput)`
const Textfield = styled(DebounceInput).attrs<TextfieldProps>(() => ({
  element: 'input',
}))<TextfieldCSSProps>`
  ${TextfieldCSS}

  --texfield-font-size: 1.5rem;
  --textfield-border-radius: var(--border-radius);
  --textfield-font-weight: 400;
  --textfield-height: 100%;
  --textfield-padding: 0 calc(20px + var(--theme-common-space) * 3) 0 var(--theme-common-space);
  --textfield-background-color: ${({ theme: { colors } }) => colors.cream};
  --textfield-border-color: ${({ theme: { colors } }) => colors.cream};
  --textfield-border-color-error: ${({ theme: { colors } }) => colors.error};
  --textfield-color: ${({ theme: { colors } }) => colors.darkestGrey};

  background-color: var(--textfield-background-color);
  border-width: 0;
  border-style: solid;
  border-color: ${({ status }) =>
    status === TextfieldStatus.error
      ? 'var(--textfield-border-color-error)'
      : 'var(--textfield-border-color)'};
  color: var(--textfield-color);
  font-size: var(--texfield-font-size);
  font-weight: 400;
  height: 64px;
  position: relative;
  transition: border-color 0.15s linear;
  width: 100%;
  z-index: 1;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    --textfield-padding: 0 calc(20px + var(--theme-common-space) * 4) 0
      calc(var(--theme-common-space) * 2);
  }

  &:active,
  &:focus,
  &input:-internal-autofill-selected {
    background-color: var(--textfield-background-color) !important;
    border-color: ${({ status }) =>
      status === TextfieldStatus.error
        ? 'var(--textfield-border-color-error)'
        : 'var(--textfield-border-color)'};
    color: var(--textfield-color) !important;
  }

  &[disabled],
  &[disabled]:hover {
    background-color: var(--textfield-background-color);
    border-color: var(--textfield-border-color);
    color: var(--textfield-color);
    cursor: not-allowed;
    opacity: 0.5;
  }

  &[disabled]::placeholder,
  &[disabled]:hover::placeholder {
    color: var(--textfield-color) !important;
  }

  &::placeholder {
    color: var(--textfield-color);
    font-size: var(--texfield-font-size);
    font-style: normal;
    font-weight: var(--textfield-font-weight);
    opacity: 0.6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &[readonly] {
    background-color: var(--textfield-background-color);
    border-color: var(--textfield-border-color);
    color: var(--textfield-color);
    cursor: default;
    font-style: normal;
  }

  &[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;

    ::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &::-webkit-search-decoration {
    -webkit-appearance: none;
  }
`

const Magnifier = styled(BaseMagnifier)`
  --magnifier-size: 20px;

  display: block;
  height: var(--magnifier-size);
  right: calc(var(--theme-common-space) * 2);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--magnifier-size);
  z-index: 5;

  path {
    stroke: ${({ theme: { colors } }) => colors.darkGreen};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    right: calc(var(--theme-common-space) * 2);
  }
`

const PlaceholderLink = styled(SCLink)`
  font-size: 1.8rem;
`

PlaceholderLink.defaultProps = {
  target: undefined,
  rel: undefined,
}

const NextLink = styled(Link)`
  font-size: 1.8rem;
`

const Transactions = styled(MyTransactions)`
  .fill {
    fill: ${({ theme: { colors } }) => colors.primary};
  }
`

export const Search: React.FC = ({ ...restProps }) => {
  const { address, connectWallet, isWalletConnected } = useWeb3Connection()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const _value = value.toLowerCase()
    const isValidHash = isTransactionHash(_value) || isAddress(_value) || isValidDomainName(_value)

    if (!_value.length) {
      setError('')
      return
    }

    if (!isValidHash) {
      setError('Invalid address or transaction hash.')
      return
    }

    router.push(`${bridgeExplorerBaseURL}?hash=${value}`)
  }, [value, router])

  return (
    <Wrapper {...restProps}>
      <SCTitle>Bridge Explorer</SCTitle>
      <SCText>
        Check real time transaction status
        <br /> and claim your tokens.
      </SCText>
      <SearchWrapper>
        <Textfield
          autoComplete="off"
          autoCorrect="off"
          debounceTimeout={DEBOUNCE_TIME}
          id="sidebarSearch"
          minLength={3}
          onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
          placeholder={'Search by Address / Tx Hash'}
          spellCheck="false"
          type="search"
          value={value}
        />
        <Magnifier />
      </SearchWrapper>
      {error && <SCText error>{error}</SCText>}
      {isWalletConnected && address ? (
        <NextLink
          as={SCLink}
          href={`${myTransactionsFullURL}${address}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Transactions />
          My Transactions
        </NextLink>
      ) : (
        <PlaceholderLink as="span" onClick={connectWallet}>
          <Transactions />
          My Transactions
        </PlaceholderLink>
      )}
    </Wrapper>
  )
}
