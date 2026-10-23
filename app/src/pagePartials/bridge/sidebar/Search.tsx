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
import { isAddress } from 'viem'
import { isValidDomainName } from '@/src/utils/isValidDomainName'

const SearchWrapper = styled.div`
  --border-radius: ${({ theme: { common } }) => common.borderRadiusBig};

  border-radius: var(--border-radius);
  margin: 0 0 calc(var(--theme-common-space) * 1.5);
  position: relative;
  width: 100%;
`

const Textfield = styled(DebounceInput).attrs<TextfieldProps>(() => ({
  element: 'input',
}))<TextfieldCSSProps>`
  ${TextfieldCSS}

  --texfield-font-size: 1.4rem;
  --textfield-border-radius: var(--border-radius);
  --textfield-font-weight: 400;
  --textfield-height: 100%;
  --textfield-padding: 0 calc(20px + var(--theme-common-space) * 3) 0
    calc(var(--theme-common-space) * 1.5);
  --textfield-background-color: ${({ theme: { colors } }) => colors.page};
  --textfield-border-color: ${({ theme: { colors } }) => colors.page};
  --textfield-border-color-error: ${({ theme: { colors } }) => colors.error};
  --textfield-color: ${({ theme: { colors } }) => colors.ink};

  background-color: var(--textfield-background-color);
  border-width: 1px;
  border-style: solid;
  border-color: ${({ status }) =>
    status === TextfieldStatus.error
      ? 'var(--textfield-border-color-error)'
      : 'var(--textfield-border-color)'};
  color: var(--textfield-color);
  font-size: var(--texfield-font-size);
  font-weight: 400;
  height: 52px;
  position: relative;
  transition: border-color 0.15s linear;
  width: 100%;
  z-index: 1;

  &:active,
  &:focus,
  &input:-internal-autofill-selected {
    background-color: ${({ theme: { colors } }) => colors.surface} !important;
    border-color: ${({ status, theme: { colors } }) =>
      status === TextfieldStatus.error ? 'var(--textfield-border-color-error)' : colors.violet};
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
    color: ${({ theme: { colors } }) => colors.faint};
    font-size: var(--texfield-font-size);
    font-style: normal;
    font-weight: var(--textfield-font-weight);
    opacity: 1;
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
    stroke: ${({ theme: { colors } }) => colors.fog};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    right: calc(var(--theme-common-space) * 2);
  }
`

const PlaceholderLink = styled(SCLink)`
  font-weight: 500;
`

PlaceholderLink.defaultProps = {
  target: undefined,
  rel: undefined,
}

const NextLink = styled(Link)`
  font-weight: 500;
`

const Transactions = styled(MyTransactions)`
  .fill {
    fill: ${({ theme: { colors } }) => colors.fog};
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
    <SidebarCard {...restProps}>
      <SCTitle>Bridge Explorer</SCTitle>
      <SCText>Check real time transaction status and claim your tokens.</SCText>
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
    </SidebarCard>
  )
}
