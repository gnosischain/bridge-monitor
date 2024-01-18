import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { Textfield } from '@/src/components/form/Textfield'
import debounce from 'lodash/debounce'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  flex-grow: 1;

  > input {
    flex-grow: 1;
  }
`

type TokenInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  max?: string
}

export const AmountTokenInput = ({
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
      <NumericFormat
        allowNegative={false}
        customInput={Textfield}
        defaultValue={value}
        max={max}
        onValueChange={handleChange}
        placeholder={placeholder}
        thousandSeparator={false}
        value={value}
      />
      {max && (
        <button onClick={() => onChange(max)} type="button">
          Max
        </button>
      )}
    </Wrapper>
  )
}
