import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { Textfield } from '@/src/components/form/Textfield'
import styled from 'styled-components'

const Wrapper = styled.div`
  flex-grow: 1;
  height: 100%;
`
const TextfieldAmount = styled(Textfield)`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.textColor};
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
    color: ${({ theme: { textField } }) => textField.color};
    font-size: 1.5rem;
    font-weight: 500;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 1.6rem;
    font-weight: 600;

    &::placeholder {
      font-size: 1.6rem;
      font-weight: 600;
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
      <Wrapper {...restProps}>
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
      </Wrapper>
    </>
  )
}
