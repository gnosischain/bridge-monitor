import { ListBottomInformation } from '@/src/components/transactions/ListBottomInformation'
import { TransactionsList } from '@/src/components/transactions/TransactionsList'
import { useTransactionsWithFilters } from '@/src/hooks/subgraph/useTransactions'
import { TransactionFilter } from '@/src/hooks/useTransactionsFilters'
import { Loading } from '@/src/components/loading/Loading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'

type TransactionsTableProps = {
  bridge: string
  filters: TransactionFilter
  goBackUrl?: string
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ bridge, filters, goBackUrl }) => {
  const { isLoading, transactions, updateInMemoryTransaction } = useTransactionsWithFilters(filters)
  const { validators } = useValidators(bridge as BridgesValues)

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <TransactionsList
        goBackUrl={goBackUrl}
        transactions={transactions}
        updateInMemoryTransaction={updateInMemoryTransaction}
        validators={validators}
      />
      <ListBottomInformation
        endDate={filters.endTimestamp?.toLocaleDateString() || 'undefined'}
        startDate={filters.startTimestamp?.toLocaleDateString() || 'undefined'}
        transactionsNumber={transactions.length}
      />
    </>
  )
}

export default TransactionsTable
