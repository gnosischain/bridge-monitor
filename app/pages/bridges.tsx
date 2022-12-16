import type { NextPage } from 'next'
import styled from 'styled-components'

import { Limits } from '@/src/components/limits'

const Wrapper = styled.div`
  margin-bottom: ${({ theme: { common } }) => common.space * 8}px;
`

const Bridges: NextPage = () => {
  return (
    <Wrapper>
      <h1>Daily bridge limits</h1>
      <Limits />
    </Wrapper>
  )
}
export default Bridges
