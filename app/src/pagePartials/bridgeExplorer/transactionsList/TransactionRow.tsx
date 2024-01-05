import styled from 'styled-components'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { DateTime } from '@/src/pagePartials/bridgeExplorer/transactionsList/DateTime'
import { ChainsInitiatorReceiver } from '@/src/pagePartials/bridgeExplorer/common/ChainsInitiatorReceiver'
import { TokenAddress as BaseAddress } from '@/src/components/token/TokenAddress'
import { Initiator, Receiver } from '@/src/pagePartials/bridgeExplorer/common/TokenWithValue'
import { Validators } from '@/src/pagePartials/bridgeExplorer/transactionsList/Validators'
import { StatusCell } from '@/src/pagePartials/bridgeExplorer/transactionsList/StatusCell'
import { Transaction } from '@/src/utils/transactions'
import { TR as BaseTR, TD } from '@/src/components/table'
import Link from 'next/link'
import { UpdateInMemoryTx } from '@/src/hooks/subgraph/useTransactions'
import { useMemo } from 'react'
import { transactionBaseURL } from '@/src/constants/sections'

const TR = styled(BaseTR)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjgiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik00Ljg5MyA0LjI1N0wxLjI1NyA3Ljg5M2EuMzY0LjM2NCAwIDAxLS41MTQtLjUxNEw0LjEyMyA0IC43NDIuNjIxYS4zNjQuMzY0IDAgMTEuNTE0LS41MTRsMy42MzYgMy42MzZhLjM2NC4zNjQgMCAwMTAgLjUxNHoiIGZpbGw9IiMzRTY5NTciLz48L3N2Zz4=');
    background-position: calc(100% - var(--table-padding-common))
      calc(var(--table-padding-vertical) + 7px);
    background-repeat: no-repeat;
  }
`

const MobileLabel = styled.span`
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 4px;
  text-transform: uppercase;
  white-space: nowrap;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`

const TokenAddress = styled(BaseAddress)`
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
  transform: rotate(0deg);
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
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.2;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`

const RowLink = styled.a`
  text-decoration: none;
`

type Props = {
  goBackURL?: string
  searchResultsURL?: string
  showValidations?: boolean
  transaction: Transaction
  updateInMemoryTransaction: UpdateInMemoryTx
}

export const TransactionRow: React.FC<Props> = ({
  goBackURL,
  showValidations,
  transaction,
  updateInMemoryTransaction,
  ...restProps
}) => {
  const addressCharacters = 6
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

  const txURL = useMemo(() => `${transactionBaseURL}/${id}`, [id])
  const href = goBackURL
    ? {
        pathname: txURL,
        query: { goBackURL: goBackURL },
      }
    : txURL

  return (
    // Link's `as` prop is used to show the URL in the browser's address bar without the query params
    <Link as={txURL} href={href} passHref {...restProps}>
      <TR as={RowLink} compact={!showValidations}>
        <TD>
          <MobileLabel>Transaction Hash</MobileLabel>
          <TokenAddress
            address={transactionHash}
            characters={addressCharacters}
            copy
            href={scanUrl}
          />
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
          <TokenAddress
            address={initiator}
            characters={addressCharacters}
            copy
            href={initiatorScanUrl}
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
          <TokenAddress
            address={receiver}
            characters={addressCharacters}
            copy
            href={receiverScanUrl}
          />
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
