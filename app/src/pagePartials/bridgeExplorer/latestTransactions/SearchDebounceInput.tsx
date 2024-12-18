import { SetStateAction, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { DebounceInput } from 'react-debounce-input'
import { DEBOUNCE_TIME } from '@/src/constants/misc'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import {
  TextfieldCSS,
  TextfieldCSSProps,
  TextfieldPartsCSS,
  TextfieldProps,
  TextfieldStatus,
} from '@/src/components/form/Textfield'

const Wrapper = styled.div`
  --icon-size: 20px;

  border-radius: ${({ theme: { common } }) => common.borderRadius};
  overflow: hidden;
  position: relative;
`

const Magnifier = styled(BaseMagnifier)`
  align-items: center;
  display: flex;
  height: var(--icon-size);
  justify-content: center;
  left: calc(var(--theme-common-space) * 2);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--icon-size);
`

const Textfield = styled(DebounceInput).attrs<TextfieldProps>(() => ({
  element: 'input',
}))<TextfieldCSSProps>`
  ${TextfieldCSS}
  ${TextfieldPartsCSS}

  padding-left: calc(calc(var(--theme-common-space) * 4) + var(--icon-size));
  position: relative;
  width: 100%;
  z-index: 0;
`

interface Props {
  onChange: (e: string) => void
  onEnterValue: () => void
  placeholder?: string
  reset: boolean
  status?: TextfieldStatus | undefined
}

export const SearchDebounceInput: React.FC<Props> = ({
  onChange,
  onEnterValue,
  placeholder = 'Search',
  reset,
  status,
  ...restProps
}) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    onChange(value)
    onEnterValue()
  }, [value, onChange, onEnterValue])

  useMemo(() => {
    if (reset) {
      setValue('')
    }
  }, [reset])

  console.log(restProps)

  return (
    <Wrapper {...restProps}>
      <Textfield
        autoComplete="off"
        autoCorrect="off"
        className="textfield"
        debounceTimeout={DEBOUNCE_TIME}
        id="search"
        minLength={3}
        onChange={(e: { target: { value: SetStateAction<string> } }) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck="false"
        status={status}
        type="search"
        value={value}
      />
      <Magnifier />
    </Wrapper>
  )
}
