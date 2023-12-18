import styled from 'styled-components'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { DateTime } from '@/src/components/common/DateTime'
import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { Address as BaseAddress } from '@/src/components/token/Address'
import { Initiator, Receiver } from '@/src/components/token/TokenWithValue'
import { Validators } from '@/src/pagePartials/transactionsList/Validators'
import { StatusCell } from '@/src/pagePartials/transactionsList/StatusCell'
import { Transaction } from '@/src/utils/transactions'
import { TR as BaseTR, TD } from '@/src/components/common/Table'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { UpdateInMemoryTx } from '@/src/hooks/subgraph/useTransactions'
import { useMemo } from 'react'

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
  searchResultsURL?: string
  showValidations?: boolean
  transaction: Transaction
  updateInMemoryTransaction: UpdateInMemoryTx
}

export const TransactionRow: React.FC<Props> = ({
  searchResultsURL,
  showValidations,
  transaction,
  updateInMemoryTransaction,
  ...restProps
}) => {
  const router = useRouter()
  const addressCharacters = 4
  const {
    bridgeName,
    id,
    initiator,
    initiatorAmount,
    initiatorNetwork,
    initiatorNetworkIcon,
    initiatorScanUrl,
    initiatorToken,
    receiver,
    receiverNetwork,
    receiverNetworkIcon,
    receiverScanUrl,
    scanUrl,
    timestamp,
    transactionHash,
  } = transaction

  const txURL = useMemo(() => `/transaction/${id}`, [id])

  return (
    <Link
      as={txURL}
      href={{
        pathname: txURL,
        query: { goBackButtonEnabled: 'true' },
      }}
      passHref
      {...restProps}
    >
      <TR as={RowLink} compact={!showValidations}>
        <TD>
          <MobileLabel>Transaction Hash</MobileLabel>
          <Address address={transactionHash} characters={addressCharacters} copy link={scanUrl} />
          <DateTime transactiondate={timestamp} />
        </TD>
        <TD>
          <MobileLabel>Bridge</MobileLabel>
          <ChainsInitiatorReceiver
            chainIconInitiator={initiatorNetworkIcon}
            chainIconReceiver={receiverNetworkIcon}
            chainInitiator={initiatorNetwork}
            chainReceiver={receiverNetwork}
          />
        </TD>
        <TD>
          <MobileLabel>Initiator</MobileLabel>
          <Address
            address={initiator}
            characters={addressCharacters}
            copy
            link={initiatorScanUrl}
          />
          <Initiator
            bridgeName={bridgeName}
            initiatorNetwork={initiatorNetwork}
            token={initiatorToken}
            tokenValue={initiatorAmount}
          />
        </TD>
        <TDArrow>
          <ArrowRight />
        </TDArrow>
        <TD>
          <MobileLabel>Receiver</MobileLabel>
          <Address address={receiver} characters={addressCharacters} copy link={receiverScanUrl} />
          <Receiver
            bridgeName={bridgeName}
            initiatorNetwork={initiatorNetwork}
            token={initiatorToken}
            tokenValue={initiatorAmount}
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
