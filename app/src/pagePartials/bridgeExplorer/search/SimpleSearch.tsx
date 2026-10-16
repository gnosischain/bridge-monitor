import styled from 'styled-components'
import { DebounceInput } from 'react-debounce-input'
import { TextfieldCSS, TextfieldCSSProps, TextfieldProps } from '@/src/components/form/Textfield'
import { DEBOUNCE_TIME } from '@/src/constants/misc'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { Warning } from '@/src/components/assets/Warning'
import { TextfieldStatus } from '@/src/components/form/Textfield'

interface Props {
  onChange: (e: string) => void
  placeholder?: string
  status?: TextfieldStatus | undefined
  statusMessage?: string
  value: string
}

const Wrapper = styled.div`
  --border-radius: 999px;

  border-radius: var(--border-radius);
  box-shadow: 0 8px 24px -16px rgba(7, 5, 44, 0.25);
  height: 56px;
  position: relative;
  text-align: left;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    height: 60px;
  }
`

const Textfield = styled(DebounceInput).attrs<TextfieldProps>(() => ({
  element: 'input',
}))<TextfieldCSSProps>`
  ${TextfieldCSS}

  --texfield-font-size: 1.5rem;
  --textfield-border-radius: var(--border-radius);
  --textfield-font-weight: 400;
  --textfield-height: 100%;
  --textfield-padding: 0 calc(var(--theme-common-space) * 6) 0 calc(var(--theme-common-space) * 2.5);
  --textfield-background-color: ${({ theme: { colors } }) => colors.surface};
  --textfield-border-color: ${({ theme: { colors } }) => colors.line};
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
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: var(--texfield-font-size);
  font-weight: 400;
  height: 100%;
  position: relative;
  transition: border-color 0.15s linear;
  width: 100%;
  z-index: 1;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    --textfield-padding: 0 calc(var(--theme-common-space) * 7) 0 calc(var(--theme-common-space) * 3);
    --texfield-font-size: 1.6rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    --texfield-font-size: 1.7rem;
  }

  &:active,
  &:focus,
  &input:-internal-autofill-selected {
    background-color: var(--textfield-background-color) !important;
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
  right: 14px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--magnifier-size);
  z-index: 5;

  path {
    stroke: ${({ theme: { colors } }) => colors.fog};
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    right: 24px;
  }
`

const Info = styled.div.withConfig({
  shouldForwardProp: (prop) => !['show'].includes(prop),
})<{ show: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.error};
  column-gap: 6px;
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  left: calc(var(--theme-common-space) * 3);
  line-height: 1.2;
  opacity: ${({ show }) => (show ? 1 : 0)};
  position: absolute;
  top: calc(100% + var(--theme-common-space));
  transition: opacity 0.15s linear;

  svg {
    height: 16px;
    width: 16px;
  }
`

export const SimpleSearch: React.FC<Props> = ({
  onChange,
  placeholder = 'Search by Address / Txn Hash',
  status,
  statusMessage,
  value,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <Textfield
        autoComplete="off"
        autoCorrect="off"
        debounceTimeout={DEBOUNCE_TIME}
        id="search"
        minLength={3}
        onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck="false"
        status={status}
        type="search"
        value={value}
      />
      <Magnifier />
      <Info show={status === TextfieldStatus.error}>
        <Warning /> {statusMessage}
      </Info>
    </Wrapper>
  )
}
