import styled from 'styled-components'
import { AnimatePresence } from 'framer-motion'

import { NoResultsMessage } from '@/src/components/common/NoResultsMessage'
import { TransactionRow } from '@/src/components/transactions/TransactionRow'

import { Transaction } from '@/src/utils/transactions'
import { ITEMS_PER_PAGE } from '@/src/constants/misc'

const Empty = styled(NoResultsMessage)`
  border: none;
  height: 100%;
  margin: 0;
  text-align: center;
`

interface Props {
  transactions: Transaction[]
  page: number
  updateInMemoryTransaction: (transaction: Transaction) => void
}

export const TransactionsList: React.FC<Props> = ({
  page,
  transactions,
  updateInMemoryTransaction,
}) => {
  return (
    <tbody>
      <AnimatePresence>
        {transactions.length > 0 ? (
          transactions
            .slice(0, page * ITEMS_PER_PAGE)
            .map((transaction, index) => (
              <TransactionRow
                key={`transaction_${index}`}
                transaction={transaction}
                updateInMemoryTransaction={updateInMemoryTransaction}
              />
            ))
        ) : (
          <tr>
            <td colSpan={8}>
              <Empty
                description="No results match your search criteria."
                text="No transactions were found."
              />
            </td>
          </tr>
        )}
      </AnimatePresence>
    </tbody>
  )
}
