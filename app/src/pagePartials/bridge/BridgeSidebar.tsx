import styled from 'styled-components'
import { bridgeExplorerBaseURL, myTransactionsFullURL } from '@/src/constants/sections'
import { NavLink } from '@/src/components/navigation/NavLink'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { DebounceInput } from 'react-debounce-input'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import { DEBOUNCE_TIME } from '@/src/constants/misc'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { useState } from 'react'
import { useRouter } from 'next/router'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  width: 100%;
`

const SearchWrapper = styled.div`
  --border-radius: 8px;

  border-radius: var(--border-radius);
  margin: 0 0 20px;
  position: relative;
  width: 100%;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Textfield: any = styled(DebounceInput)`
  ${TextfieldCSS}

  --texfield-font-size: 1.5rem;
  --textfield-border-radius: var(--border-radius);
  --textfield-font-weight: 400;
  --textfield-height: 100%;
  --textfield-padding: 12px 36px 12px 12px;
  --textfield-background-color: ${({ theme: { colors } }) => colors.cream};
  --textfield-border-color: ${({ theme: { colors } }) => colors.white};
  --textfield-border-color-error: ${({ theme: { colors } }) => colors.darkerGrey};
  --textfield-color: ${({ theme: { colors } }) => colors.darkestGrey};

  background-color: var(--textfield-background-color);
  border-width: 2px;
  border-style: solid;
  border-color: ${({ status }) =>
    status === TextfieldStatus.error
      ? 'var(--textfield-border-color-error)'
      : 'var(--textfield-border-color)'};
  box-shadow: 0 38.51852px 25.48148px 0 rgba(0, 0, 0, 0.12), 0 100px 80px 0 rgba(0, 0, 0, 0.2),
    0 4px 4px 0 rgba(0, 0, 0, 0.25);
  color: var(--textfield-color);
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: var(--texfield-font-size);
  font-weight: 400;
  height: auto;
  position: relative;
  transition: border-color 0.15s linear;
  width: 100%;
  z-index: 1;

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

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    --textfield-padding: 12px 48px 12px 12px;
    --texfield-font-size: 1.6rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    --texfield-font-size: 1.8rem;
  }
`

const Magnifier = styled(BaseMagnifier)`
  --magnifier-size: 20px;

  display: block;
  height: var(--magnifier-size);
  right: 14px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--magnifier-size);
  z-index: 5;

  path {
    stroke: ${({ theme: { colors } }) => colors.darkGreen};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    right: 24px;
  }
`

const Link = styled(NavLink)`
  color: #fff;
`

export const BridgeSidebar: React.FC = ({ ...restProps }) => {
  const { address } = useWeb3Connection()
  const [value, setValue] = useState('')
  const router = useRouter()

  return (
    <Wrapper {...restProps}>
      <SearchWrapper>
        <Textfield
          autoComplete="off"
          debounceTimeout={DEBOUNCE_TIME}
          id="sidebarSearch"
          minLength={3}
          onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
          onKeyDown={(e: { key: string }) => {
            if (e.key === 'Enter' && value) {
              router.push(`${bridgeExplorerBaseURL}?hash=${value}`)
            }
          }}
          placeholder={'Search by Address / Tx Hash'}
          type="search"
          value={value}
        />
        <Magnifier />
      </SearchWrapper>
      {address && <Link href={`${myTransactionsFullURL}${address}`}>My Transactions</Link>}
    </Wrapper>
  )
}
