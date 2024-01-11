import styled from 'styled-components'
import { ArrowRight } from '@/src/components/assets/ArrowRight'
import { ChevronRight } from '@/src/components/assets/ChevronRight'
import { DateTime } from '@/src/pagePartials/bridgeExplorer/transactionsList/DateTime'
import { ChainsInitiatorReceiver } from '@/src/pagePartials/bridgeExplorer/common/ChainsInitiatorReceiver'
import { TokenAddress as BaseAddress } from '@/src/components/token/TokenAddress'
import { Initiator, Receiver } from '@/src/pagePartials/bridgeExplorer/common/TokenWithValue'
import { Validators } from '@/src/pagePartials/bridgeExplorer/transactionsList/Validators'
import { StatusCell } from '@/src/pagePartials/bridgeExplorer/transactionsList/StatusCell'
import { Transaction } from '@/src/utils/transactions'
import { TD, TR } from '@/src/components/table'
import Link from 'next/link'
import { UpdateInMemoryTx } from '@/src/hooks/subgraph/useTransactions'
import { useMemo } from 'react'
import { transactionBaseURL } from '@/src/constants/sections'

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

const StatusWrapper = styled.div`
  > svg {
    display: none;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: center;
    column-gap: var(--theme-common-space);
    display: flex;
    justify-content: space-between;
    width: 100%;

    > svg {
      display: block;
    }
  }
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
          <TD>
            <MobileLabel>Validators</MobileLabel>
            <Validators transaction={transaction} />
          </TD>
        )}
        <TDLastMobile>
          <StatusWrapper>
            <MobileLabel>Status</MobileLabel>
            <StatusCell
              transaction={transaction}
              updateInMemoryTransaction={updateInMemoryTransaction}
            />
            <ChevronRight />
          </StatusWrapper>
          <ViewMore>View More &gt;</ViewMore>
        </TDLastMobile>
      </TR>
    </Link>
  )
}
