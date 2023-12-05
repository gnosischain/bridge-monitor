import styled from 'styled-components'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { DateTime } from '@/src/components/common/DateTime'
import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { Address as BaseAddress } from '@/src/components/token/Address'
import { Initiator, Receiver } from '@/src/components/token/TokenWithValue'
import { Validators } from '@/src/pagePartials/transactions/Validators'
import { StatusCell } from '@/src/pagePartials/transactionsList/StatusCell'
import { Transaction } from '@/src/utils/transactions'
import { TR as BaseTR, TD } from '@/src/components/common/Table'
import Link from 'next/link'
import { useRouter } from 'next/router'

const TR = styled(BaseTR)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNSIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00Ljg5MyA0LjI1N0wxLjI1NyA3Ljg5M2EuMzY0LjM2NCAwIDAxLS41MTQtLjUxNEw0LjEyMiA0IC43NDIuNjIxYS4zNjQuMzY0IDAgMTEuNTE1LS41MTRsMy42MzYgMy42MzZhLjM2My4zNjMgMCAwMTAgLjUxNHoiIGZpbGw9IiNGMEVCREUiLz48L3N2Zz4=');
    background-position: calc(100% - var(--table-padding-common))
      calc(var(--table-padding-vertical) + 7px);
    background-repeat: no-repeat;
  }
`

const MobileLabel = styled.span`
  display: block;
  font-size: 1.2rem;
  font-weight: 300;
  line-height: 1.2;
  margin: 0 0 4px;
  opacity: 0.6;
  text-transform: uppercase;
  white-space: nowrap;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`

const Address = styled(BaseAddress)`
  margin-bottom: 8px;
`

const TDArrow = styled(TD)`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: center;
    display: flex;
    margin: auto;
  }
`

const ArrowRight = styled(ArrowUp)`
  display: block;
  transform: rotate(-90deg);
`

const TDValidators = styled(TD)`
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding-left: 0;
    padding-right: 0;
  }
`

const TDLastMobile = styled(TD)`
  align-items: flex-end;
  flex-direction: row;
  justify-content: space-between;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: flex-start;
  }
`

const ViewMore = styled.span`
  color: ${({ theme: { colors } }) => colors.tertiary};
  font-size: 1.2rem;
  line-height: 1.2;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`

const RowLink = styled.a`
  text-decoration: none;
`

type Props = {
  shallowUrl?: string
  showValidations?: boolean
  transaction: Transaction
  updateInMemoryTransaction: (transaction: Transaction) => void
}

export const TransactionRow: React.FC<Props> = ({
  shallowUrl,
  showValidations,
  transaction,
  updateInMemoryTransaction,
  ...restProps
}) => {
  const router = useRouter()
  const addressCharacters = 4

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (e: any) => {
    e.stopPropagation()

    // shallow update of the new URL to allow go back to the previous page
    if (shallowUrl) {
      router.push(shallowUrl, undefined, { shallow: true })
    }
  }

  const basePath = '/transaction/'
  const href = shallowUrl
    ? {
        pathname: `${basePath}${transaction.id}`,
        query: { goBack: 'true' },
      }
    : {
        pathname: `${basePath}${transaction.id}`,
      }

  return (
    <Link href={href} passHref {...restProps}>
      <TR as={RowLink} compact={!showValidations} onClick={handleRowClick}>
        <TD>
          <MobileLabel>Transaction Hash</MobileLabel>
          <Address
            address={transaction.transactionHash}
            characters={addressCharacters}
            copy
            link={transaction.scanUrl}
          />
          <DateTime transactiondate={transaction.timestamp} />
        </TD>
        <TD>
          <MobileLabel>Bridge</MobileLabel>
          <ChainsInitiatorReceiver
            chainIconInitiator={transaction.initiatorNetworkIcon}
            chainIconReceiver={transaction.receiverNetworkIcon}
            chainInitiator={transaction.initiatorNetwork}
            chainReceiver={transaction.receiverNetwork}
          />
        </TD>
        <TD>
          <MobileLabel>Initiator</MobileLabel>
          <Address
            address={transaction.initiator}
            characters={addressCharacters}
            copy
            link={transaction.initiatorScanUrl}
          />
          <Initiator
            bridgeName={transaction.bridgeName}
            initiatorNetwork={transaction.initiatorNetwork}
            token={transaction.initiatorToken}
            tokenValue={transaction.initiatorAmount}
          />
        </TD>
        <TDArrow>
          <ArrowRight />
        </TDArrow>
        <TD>
          <MobileLabel>Receiver</MobileLabel>
          <Address
            address={transaction.receiver}
            characters={addressCharacters}
            copy
            link={transaction.receiverScanUrl}
          />
          <Receiver
            bridgeName={transaction.bridgeName}
            initiatorNetwork={transaction.initiatorNetwork}
            token={transaction.initiatorToken}
            tokenValue={transaction.initiatorAmount}
          />
        </TD>
        {showValidations && (
          <TDValidators>
            <MobileLabel>Validators</MobileLabel>
            <Validators transaction={transaction} />
          </TDValidators>
        )}
        <TDLastMobile>
          <div>
            <MobileLabel>Status</MobileLabel>
            <StatusCell
              transaction={transaction}
              updateInMemoryTransaction={updateInMemoryTransaction}
            />
          </div>
          <ViewMore>View More &gt;</ViewMore>
        </TDLastMobile>
      </TR>
    </Link>
  )
}
