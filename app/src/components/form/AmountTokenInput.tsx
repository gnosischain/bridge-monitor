import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { Textfield } from '@/src/components/form/Textfield'
import debounce from 'lodash/debounce'
import styled from 'styled-components'

const Wrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  position: relative;
`
const TextfieldAmount = styled(Textfield)`
  background: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  font-size: 1.5rem;
  font-weight: 500;
  height: 100%;
  padding-left: var(--theme-common-space);
  padding-right: var(--theme-common-space);
  position: relative;
  text-align: right;
  z-index: 1;

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
const MaxButton = styled.button`
  background-color: transparent;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: 1px solid ${({ theme: { colors } }) => colors.primary};
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  font-size: 1.4rem;
  padding: 2px var(--theme-common-space);
  position: absolute;
  left: var(--theme-common-space);
  z-index: 10;
  top: 50%;
  transform: translateY(-50%);

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
`

type TokenInputProps = {
  disabled?: boolean
  max?: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

export const AmountTokenInput = ({
  disabled,
  max,
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
    <Wrapper {...restProps}>
      {max && (
        <MaxButton disabled={disabled} onClick={() => onChange(max)} type="button">
          Max
        </MaxButton>
      )}
      <NumericFormat
        allowNegative={false}
        customInput={TextfieldAmount}
        defaultValue={value}
        max={max}
        onValueChange={handleChange}
        placeholder={placeholder}
        thousandSeparator={false}
        value={value}
      />
    </Wrapper>
  )
}
