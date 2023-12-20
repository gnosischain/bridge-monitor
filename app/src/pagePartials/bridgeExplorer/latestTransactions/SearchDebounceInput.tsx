import { SetStateAction, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { DebounceInput } from 'react-debounce-input'
import { DEBOUNCE_TIME } from '@/src/constants/misc'
import { Magnifier as BaseMagnifier } from '@/src/components/assets/Magnifier'
import { TexfieldPartsCSS, TextfieldCSS, TextfieldStatus } from '@/src/components/form/Textfield'

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
  left: ${({ theme: { common } }) => common.space * 2}px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--icon-size);
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Textfield: any = styled(DebounceInput)`
  ${TextfieldCSS}
  ${TexfieldPartsCSS}

  padding-left: calc(${({ theme: { common } }) => common.space * 4}px + var(--icon-size));
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

  return (
    <Wrapper {...restProps}>
      <Textfield
        autoComplete="off"
        className="textfield"
        debounceTimeout={DEBOUNCE_TIME}
        id="search"
        minLength={3}
        onChange={(e: { target: { value: SetStateAction<string> } }) => setValue(e.target.value)}
        placeholder={placeholder}
        status={status}
        type="search"
        value={value}
      />
      <Magnifier />
    </Wrapper>
  )
}
