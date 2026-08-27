import { NoResultsMessage } from '@/src/pagePartials/bridgeExplorer/transactionsList/NoResultsMessage'
import { TransactionRow } from '@/src/pagePartials/bridgeExplorer/transactionsList/TransactionRow'
import { Transaction } from '@/src/utils/transactions'
import { TransactionHeader } from '@/src/pagePartials/bridgeExplorer/transactionsList/TransactionsHeader'
import { Validator } from '@/src/utils/validators'
import { Table } from '@/src/components/table'
import { ClaimActions } from '@/src/hooks/useTransactions'

interface Props {
  goBackURL?: string
  transactions: Transaction[]
  claimActions: ClaimActions
  validators?: Validator[] | undefined
}

export const TransactionsList: React.FC<Props> = ({
  claimActions,
  goBackURL,
  transactions,
  validators,
  ...restProps
}) => {
  const hasTransactions = transactions.length > 0

  return hasTransactions ? (
    <Table {...restProps}>
      <TransactionHeader validators={validators} />
      {transactions.map((transaction) => (
        <TransactionRow
          claimActions={claimActions}
          goBackURL={goBackURL}
          key={`transaction_${transaction.id}`}
          showValidations={validators ? true : false}
          transaction={transaction}
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
