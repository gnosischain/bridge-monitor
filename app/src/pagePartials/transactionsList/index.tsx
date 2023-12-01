import { NoResultsMessage } from '@/src/components/common/NoResultsMessage'
import { TransactionRow } from '@/src/pagePartials/transactions/TransactionRow'
import { Transaction } from '@/src/utils/transactions'
import { TransactionHeader } from '@/src/pagePartials/transactions/TransactionsHeader'
import { Validator } from '@/src/utils/validators'
import { Table } from '@/src/components/common/Table'

interface Props {
  goBackUrl?: string
  shallowUrl?: string
  transactions: Transaction[]
  updateInMemoryTransaction: (transaction: Transaction) => void
  validators?: Validator[] | undefined
}

export const TransactionsList: React.FC<Props> = ({
  goBackUrl,
  shallowUrl,
  transactions,
  updateInMemoryTransaction,
  validators,
  ...restProps
}) => {
  const hasTransactions = transactions.length > 0

  return hasTransactions ? (
    <Table {...restProps}>
      <TransactionHeader validators={validators} />
      {transactions.map((transaction) => (
        <TransactionRow
          goBackUrl={goBackUrl}
          key={`transaction_${transaction.id}`}
          shallowUrl={shallowUrl}
          showValidations={validators ? true : false}
          transaction={transaction}
          updateInMemoryTransaction={updateInMemoryTransaction}
        />
      ))}
    </Table>
  ) : (
    <NoResultsMessage
      description={
        <>
          Check that the transaction hash
          <br />
          is correct or try again later.
        </>
      }
      title="There are no matching entries"
    />
  )
}
