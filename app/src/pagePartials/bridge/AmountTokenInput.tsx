import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { Textfield } from '@/src/components/form/Textfield'
import debounce from 'lodash/debounce'
import styled from 'styled-components'
// import { Balance } from '@/src/pagePartials/bridge/Balance'
import { Token } from '@/types/token'

const Wrapper = styled.div`
  flex-grow: 1;
  height: 100%;
`
const TextfieldAmount = styled(Textfield)`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  font-size: 1.5rem;
  font-weight: 500;
  height: 100%;
  padding-left: var(--theme-common-space);
  padding-right: var(--theme-common-space);
  text-align: right;

  &:active,
  &:focus {
    background: ${({ theme: { colors } }) => colors.creamLight};
  }

  &::placeholder {
    font-size: 1.5rem;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
    font-weight: 600;

    &::placeholder {
      font-size: 1.6rem;
    }
  }
`
const Max = styled.button`
  background-color: transparent;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: 1px solid ${({ theme: { colors } }) => colors.primary};
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  font-size: 1.3rem;
  padding: 2px var(--theme-common-space);

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.primary};
    color: ${({ theme: { colors } }) => colors.white};
  }

  &:disabled {
    &,
    &:hover {
      background-color: transparent;
      border: 1px solid ${({ theme: { colors } }) => colors.primary};
      color: ${({ theme: { colors } }) => colors.primary};
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &:active {
    opacity: 0.7;
  }
`

Max.defaultProps = {
  type: 'button',
}

export const MaxButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({
  disabled,
  onClick,
}) => {
  return (
    <Max disabled={disabled} onClick={onClick}>
      Max
    </Max>
  )
}

type TokenInputProps = {
  disabled?: boolean
  max?: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

export const AmountTokenInput = ({
  onChange,
  placeholder,
  value,
  ...restProps
}: TokenInputProps) => {
  const handleChange = debounce(({ floatValue, formattedValue, value }: NumberFormatValues) => {
    try {
      onChange(value || '')
    } catch (error) {
      console.log(error, floatValue, formattedValue, value)
    }
  }, 500)

  return (
    <>
      <Wrapper {...restProps}>
        <NumericFormat
          allowNegative={false}
          customInput={TextfieldAmount}
          defaultValue={value}
          onValueChange={handleChange}
          placeholder={placeholder}
          thousandSeparator={false}
          value={value}
        />
      </Wrapper>
    </>
  )
}
