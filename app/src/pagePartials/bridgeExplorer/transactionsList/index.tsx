import { NoResultsMessage } from '@/src/pagePartials/bridgeExplorer/transactionsList/NoResultsMessage'
import { TransactionRow } from '@/src/pagePartials/bridgeExplorer/transactionsList/TransactionRow'
import { Transaction } from '@/src/utils/transactions'
import { TransactionHeader } from '@/src/pagePartials/bridgeExplorer/transactionsList/TransactionsHeader'
import { Validator } from '@/src/utils/validators'
import { Table } from '@/src/components/table'
import { UpdateInMemoryTx } from '@/src/hooks/subgraph/useTransactions'

interface Props {
  goBackURL?: string
  transactions: Transaction[]
  updateInMemoryTransaction: UpdateInMemoryTx
  validators?: Validator[] | undefined
}

export const TransactionsList: React.FC<Props> = ({
  goBackURL,
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
          goBackURL={goBackURL}
          key={`transaction_${transaction.id}`}
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
