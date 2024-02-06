import { NumberFormatValues, NumericFormat } from 'react-number-format'
import { Textfield } from '@/src/components/form/Textfield'
import debounce from 'lodash/debounce'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  flex-grow: 1;
  height: 100%;

  > input {
    flex-grow: 1;
  }
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    column-gap: calc(var(--theme-common-space) * 2);
  }
`
const TextfieldAmount = styled(Textfield)`
  height: 100%;
  font-size: 1.5rem;
  font-weight: 500;
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
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
const MaxButton = styled.button`
  font-size: 1.4rem;
  border: 1px solid ${({ theme: { colors } }) => colors.primary};
  color: ${({ theme: { colors } }) => colors.primary};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  background-color: transparent;
  padding: 4px var(--theme-common-space);
  cursor: pointer;
  &:hover {
    background-color: ${({ theme: { colors } }) => colors.primary};
    color: ${({ theme: { colors } }) => colors.white};
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
        customInput={TextfieldAmount}
        defaultValue={value}
        max={max}
        onValueChange={handleChange}
        placeholder={placeholder}
        thousandSeparator={false}
        value={value}
      />
      {max && (
        <MaxButton onClick={() => onChange(max)} type="button">
          Max
        </MaxButton>
      )}
    </Wrapper>
  )
}
