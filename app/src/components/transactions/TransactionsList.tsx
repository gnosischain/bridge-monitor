import styled from 'styled-components'
import { AnimatePresence } from 'framer-motion'

import { NoResultsMessage } from '@/src/components/common/NoResultsMessage'
import { TransactionRow } from '@/src/components/transactions/TransactionRow'

import { Transaction } from '@/src/utils/transactions'

const TBody = styled.tbody`
  display: table-row-group;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: table-row-group;
  }
`

const Empty = styled(NoResultsMessage)`
  border: none;
  height: 100%;
  margin: 0;
  text-align: center;
`

interface Props {
  transactions: Transaction[]
  updateInMemoryTransaction: (transaction: Transaction) => void
}

export const TransactionsList: React.FC<Props> = ({ transactions, updateInMemoryTransaction }) => {
  return (
    <TBody>
      <AnimatePresence>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
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
    </TBody>
  )
}
