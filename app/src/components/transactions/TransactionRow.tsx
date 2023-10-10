import styled from 'styled-components'

import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

import { DateTime } from '@/src/components/assets/DateTime'
import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { ArrowUp } from '@/src/components/assets/ArrowUp'
import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { Status as BaseStatus } from '@/src/components/common/Status'
import { Address } from '@/src/components/token/Address'
import { TokenWithValue } from '@/src/components/token/TokenWithValue'
import { Validators as BaseValidators } from '@/src/components/transactions/Validators'
import { Transaction } from '@/src/utils/transactions'
import { TransactionStatus } from '@/types/generated/subgraph'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const TD = styled.td`
  --td-padding-vertical: ${({ theme: { common } }) => common.space * 3}px;
  --td-padding-horizontal: ${({ theme: { common } }) => common.space * 2}px;

  flex-grow: 1;
  transition: background-color 0.15s linear;
  vertical-align: middle;
  padding: 0 var(--td-padding-horizontal);

  &:first-child {
    padding-top: var(--td-padding-vertical);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding: var(--td-padding-vertical) var(--td-padding-horizontal);
  }
`

const ViewMore = styled.span`
  color: ${({ theme: { colors } }) => colors.tertiary};
  font-size: 1.2rem;
  line-height: 1.2;
  height: fit-content;
  position: absolute;
  right: var(--td-padding-horizontal);
  bottom: var(--td-padding-vertical);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: none;
  }
`

const TDLastMobile = styled(TD)`
  padding-bottom: var(--td-padding-vertical);
  position: relative;
`

const TDValidators = styled(TD)`
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  padding: 0 var(--td-padding-horizontal);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding: var(--td-padding-vertical) 0;
  }
`

const TDInitiatorReceiver = styled(TD)`
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: table-cell;
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

const InitiatorReceiverAddress = styled(Address)``

const InitiatorReceiverWrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${MobileLabel} {
    margin: 0;
  }

  ${InitiatorReceiverAddress} {
    margin-bottom: 10px;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    align-items: center;
    column-gap: ${({ theme: { common } }) => common.space * 3}px;
    flex-direction: row;
    margin-bottom: 4px;

    ${InitiatorReceiverAddress} {
      margin-bottom: 0;
    }
  }
`

const ArrowRight = styled(ArrowUp)`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: block;
    transform: rotate(-90deg);
  }
`

const TR = styled.tr`
  cursor: pointer;
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  border-bottom: 4px solid ${({ theme: { colors } }) => colors.black};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  row-gap: 10px;

  &:last-child {
    ${TDValidators} {
      border-bottom-left-radius: ${({ theme: { common } }) => common.borderRadius};
      border-bottom-right-radius: ${({ theme: { common } }) => common.borderRadius};
    }
  }

  &:hover {
    &:active {
      ${TD} {
        opacity: 0.8;
      }
    }
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    background-color: transparent;
    border-bottom-width: 1px;
    display: table-row;
    margin: 0;

    &:hover {
      ${TD} {
        background-color: rgba(255, 255, 255, 0.03);
      }
    }
  }
`

const Status = styled(BaseStatus)`
  margin: auto;
  display: inline-flex;
  justify-content: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: flex;
  }
`

const TDChevron = styled(TD)`
  display: none;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: table-cell;
    padding-left: 0;
    vertical-align: middle;
  }
`

const ChevronRight = styled(ChevronDown)`
  transform: rotate(-90deg);
`

const Validators = styled(BaseValidators)`
  justify-content: flex-start;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    justify-content: center;
  }
`

interface Props {
  transaction: Transaction
}

export const TransactionRow: React.FC<Props> = ({ transaction, ...restProps }) => {
  const { isWalletConnected, isWalletNetworkSupported } = useWeb3Connection()
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (e: any) => {
    e.stopPropagation()

    router.push({
      pathname: `/${transaction.transactionHash}`,
      query: { id: transaction.id },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClaim = (e: any) => {
    e.stopPropagation()

    console.log('claiming')
  }

  return (
    <TR
      animate={{ y: 0, opacity: 1 }}
      as={motion.tr}
      exit={{ y: 10, opacity: 0 }}
      initial={{ y: -5, opacity: 0 }}
      key={transaction.id}
      onClick={handleRowClick}
      transition={{ duration: 0.4 }}
      {...restProps}
    >
      <TD>
        <MobileLabel>Transaction Hash</MobileLabel>
        <Address
          address={transaction.transactionHash}
          characters={6}
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
      <TDInitiatorReceiver>
        <InitiatorReceiverWrapper>
          <MobileLabel>Initiator</MobileLabel>
          <InitiatorReceiverAddress
            address={transaction.initiator}
            characters={6}
            copy
            link={transaction.initiatorScanUrl}
          />
          <ArrowRight />
          <MobileLabel>Receiver</MobileLabel>
          <InitiatorReceiverAddress
            address={transaction.receiver}
            characters={6}
            copy
            link={transaction.receiverScanUrl}
          />
        </InitiatorReceiverWrapper>
        <MobileLabel>Amount</MobileLabel>
        <TokenWithValue
          bridgeName={transaction.bridgeName}
          token={transaction.initiatorToken}
          tokenValue={transaction.initiatorAmount}
        />
      </TDInitiatorReceiver>
      <TDValidators>
        <MobileLabel>Validators</MobileLabel>
        {/* States available: pending, submitted, submittedExecuted, executed, notRequired */}
        <Validators transaction={transaction} />
      </TDValidators>
      <TDLastMobile>
        <MobileLabel>Status</MobileLabel>
        <Status
          /**
           * Status behaves "as" button when the status is "Unclaimed",
           * we need to disable it when it's not possible to claim.
           * As "disable" is not recognized as a valid attribute by TS,
           * we need to use the eslint-disable-next-line to ignore the error.
           **/
          /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
          /* @ts-ignore */
          disabled={!isWalletConnected || !isWalletNetworkSupported}
          onClick={
            transaction.transactionStatus === TransactionStatus.Unclaimed
              ? (e) => handleClaim(e)
              : undefined
          }
          status={transaction.transactionStatus}
        />
        <ViewMore>View More &gt;</ViewMore>
      </TDLastMobile>
      <TDChevron>
        <ChevronRight />
      </TDChevron>
    </TR>
  )
}
