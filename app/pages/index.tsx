import type { NextPage } from 'next'
import styled from 'styled-components'

import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Transactions } from '@/src/components/transactions'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Home: NextPage = () => {
  return (
    <Wrapper>
      <Transactions bridge="xDai" />
    </Wrapper>
  )
}
export default genericSuspense(Home)
