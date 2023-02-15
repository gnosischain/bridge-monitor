import type { NextPage } from 'next'

import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Transactions } from '@/src/components/transactions'

const Home: NextPage = () => {
  return <Transactions />
}
export default genericSuspense(Home)
