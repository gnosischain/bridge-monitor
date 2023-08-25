import { AnimatePresence } from 'framer-motion'

import { NoResultsMessage } from '@/src/components/common/NoResultsMessage'
import { TransactionRow } from '@/src/components/transactions/TransactionRow'
import { ITEMS_PER_PAGE } from '@/src/constants/misc'
import { Transaction } from '@/src/utils/transactions'

interface Props {
  transactions: Transaction[]
  page: number
}

export const TransactionsList: React.FC<Props> = ({ page, transactions }) => {
  return (
    <tbody>
      <AnimatePresence>
        {transactions.length > 0 ? (
          transactions
            .slice(0, page * ITEMS_PER_PAGE)
            .map((transaction, index) => (
              <TransactionRow key={`transaction_${index}`} transaction={transaction} />
            ))
        ) : (
          <tr>
            <td colSpan={8}>
              <NoResultsMessage
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
