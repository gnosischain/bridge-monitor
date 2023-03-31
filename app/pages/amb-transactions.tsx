import type { NextPage } from 'next'
import styled from 'styled-components'

import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Transactions } from '@/src/components/transactions'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const AMBTransactions: NextPage = () => {
  return (
    <Wrapper>
      <Transactions />
    </Wrapper>
  )
}
export default genericSuspense(AMBTransactions)
