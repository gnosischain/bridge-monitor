import Image from 'next/image'
import { SetStateAction, useEffect, useState } from 'react'
import styled from 'styled-components'

import { DebounceInput } from 'react-debounce-input'

import { Search } from './Search'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import { DEBOUNCE_TIME } from '@/src/constants/misc'

const Textfield: any = styled(DebounceInput)`
  ${TextfieldCSS}

  padding-left: 40px;
  position: relative;
  width: 100%;
  z-index: 0;
`

interface Props {
  placeholder?: string
  onChange: (e: string) => void
}

export const SearchDebounceInput: React.FC<Props> = ({ onChange, placeholder = 'Search' }) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    onChange(value)
  }, [value, onChange])

  return (
    <Search>
      <Textfield
        debounceTimeout={DEBOUNCE_TIME}
        id="Search"
        onChange={(e: { target: { value: SetStateAction<string> } }) => setValue(e.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      <div className="icon">
        <Image alt="search" height={15} src="/images/icon-search.svg" width={15} />
      </div>
    </Search>
  )
}
