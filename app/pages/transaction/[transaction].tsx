import type { NextPage } from 'next'
import { Transaction, TransactionSkeletonLoading } from '@/src/pagePartials/transaction'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import dynamic from 'next/dynamic'

const TokenListProvider = dynamic(() => import('@/src/providers/TokenListProvider'), {
  ssr: false,
})

const TransactionPage: NextPage = genericSuspense(
  () => {
    return (
      <ValidatorsProvider>
        <TokenListProvider>
          <Transaction />
        </TokenListProvider>
      </ValidatorsProvider>
    )
  },
  () => <TransactionSkeletonLoading />,
)

export default TransactionPage
