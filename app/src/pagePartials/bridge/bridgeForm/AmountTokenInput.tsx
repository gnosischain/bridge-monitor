import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { Textfield } from '@/src/components/form/Textfield'
import styled from 'styled-components'

export const AmountInputWrapper = styled.div`
  flex-grow: 1;
  min-width: 0;
`

const TextfieldAmount = styled(Textfield)`
  background-color: transparent;
  border-color: transparent;
  border-radius: 0;
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 2.6rem;
  font-weight: 500;
  height: 44px;
  letter-spacing: -0.02em;
  padding: 0;
  text-align: left;

  &:active,
  &:focus {
    background-color: transparent;
    border-color: transparent;
  }

  &::placeholder {
    color: ${({ theme: { colors } }) => colors.faint};
    font-size: 2.6rem;
    font-weight: 500;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;

    &::placeholder {
      font-size: 3.2rem;
    }
  }
`
const Max = styled.button`
  background-color: ${({ theme: { colors } }) => colors.lilac};
  border-radius: 999px;
  border: none;
  color: ${({ theme: { colors } }) => colors.violet};
  cursor: pointer;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  padding: 4px var(--theme-common-space);

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.violet};
    color: ${({ theme: { colors } }) => colors.surface};
  }

  &:disabled {
    &,
    &:hover {
      background-color: ${({ theme: { colors } }) => colors.lilac};
      color: ${({ theme: { colors } }) => colors.violet};
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
  decimals: number
  disabled?: boolean
  max?: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

export const AmountTokenInput = ({
  decimals,
  onChange,
  placeholder,
  value,
  ...restProps
}: TokenInputProps) => {
  const handleChange = ({ floatValue, formattedValue, value }: NumberFormatValues) => {
    try {
      onChange(value || '')
    } catch (error) {
      console.log(error, floatValue, formattedValue, value)
    }
  }

  return (
    <>
      <AmountInputWrapper {...restProps}>
        <NumericFormat
          allowNegative={false}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          customInput={TextfieldAmount as any}
          defaultValue={value}
          isAllowed={({ value }) => {
            const [, _decimals] = value.toString().split('.')
            if (!_decimals) return true
            return decimals >= _decimals?.length
          }}
          onValueChange={handleChange}
          placeholder={placeholder}
          thousandSeparator={false}
          value={value}
        />
      </AmountInputWrapper>
    </>
  )
}
