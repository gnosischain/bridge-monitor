import Image from 'next/image'
import { SetStateAction, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Search } from './Search'
import { Textfield as BaseTextField } from '@/src/components/form/Textfield'

const Textfield: any = styled(BaseTextField)`
  padding-left: 40px;
  position: relative;
  width: 100%;
  z-index: 0;
`

interface Props {
  onChange: (e: string) => void
}

export const SearchInput: React.FC<Props> = ({ onChange }) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    onChange(value)
  }, [value, onChange])

  return (
    <Search>
      <Textfield
        disabled={false}
        id="Search"
        onChange={(e: { target: { value: SetStateAction<string> } }) => setValue(e.target.value)}
        placeholder="Search"
        status=""
        type="text"
        value={value}
      />
      <div className="icon">
        <Image alt="search" height={15} src="/images/icon-search.svg" width={15} />
      </div>
    </Search>
  )
}
