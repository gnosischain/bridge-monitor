import styled from 'styled-components'

import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

import { DateTime } from '@/src/components/assets/DateTime'
import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { InitiatorReceiver } from '@/src/components/common/InitiatorReceiver'
import { Status } from '@/src/components/common/Status'
import { ButtonPrimary } from '@/src/components/buttons/Button'
import { Address } from '@/src/components/token/Address'
import { Validators } from '@/src/components/transactions/Validators'
import { Transaction } from '@/src/utils/transactions'

const Bridge = styled.div`
  font-size: 1.4rem;
  min-width: 100px;

  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    min-width: auto;
  }
`
const BridgeWrapper = styled.div`
  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    align-items: center;
    display: flex;
    gap: ${({ theme: { common } }) => common.space * 2}px;
  }
`

const TD = styled.td`
  --td-padding-vertical: ${({ theme: { common } }) => common.space * 3}px;
  --td-padding-horizontal: ${({ theme: { common } }) => common.space * 2}px;

  border-bottom: 1px solid ${({ theme }) => theme.colors.black};
  flex-grow: 1;
  padding: var(--td-padding-vertical) var(--td-padding-horizontal);
  transition: background-color 0.15s linear;
  vertical-align: middle;

  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    border-bottom: none;
    padding: ${({ theme: { common } }) => common.space}px
      ${({ theme: { common } }) => common.space * 2}px !important;
  }
`

const TDStatus = styled(TD)`
  line-height: 0;
  min-width: 114px;
`

const TDValidators = styled(TD)`
  background-color: ${({ theme }) => theme.colors.darkerGrey};
  padding: ${({ theme: { common } }) => common.space * 3}px 0;
`

const TDReceiver = styled(TD)`
  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    display: block;
    flex-basis: 100%;
    height: 0;
    overflow: hidden;
    padding: 0 !important;
    width: 0;
  }
`

const TR = styled.tr`
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    background-color: ${({ theme }) => theme.colors.darkerGrey};
    border-radius: ${({ theme: { common } }) => common.borderRadius};
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: ${({ theme: { common } }) => common.space / 2}px 0;
    padding: ${({ theme: { common } }) => common.space}px
      ${({ theme: { common } }) => common.space}px;
  }

  &:last-child {
    ${TDValidators} {
      border-bottom-left-radius: ${({ theme: { common } }) => common.borderRadius};
      border-bottom-right-radius: ${({ theme: { common } }) => common.borderRadius};
    }
  }

  &:hover {
    ${TD} {
      background-color: rgba(255, 255, 255, 0.03);
    }

    &:active {
      ${TD} {
        opacity: 0.8;
      }
    }
  }
`

const ActionButton = styled(ButtonPrimary)`
  margin: auto;
  font-size: 1.4rem;
  padding: 6px 12px;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    width: auto;
  }
`

const ViewMore = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.tertiary};
  cursor: pointer;
  font-size: 1.3rem;
  margin: 10px auto auto auto;
  padding: 6px 12px;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    display: none;
  }
`

const TDChevron = styled(TD)`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    display: table-cell;
    padding-left: 0;
    vertical-align: middle;
  }
`

const ChevronRight = styled(ChevronDown)`
  transform: rotate(-90deg);
`

interface Props {
  transaction: Transaction
}

export const TransactionRow: React.FC<Props> = ({ transaction, ...restProps }) => {
  const router = useRouter()

  const handleRowClick = (e: any) => {
    e.stopPropagation()

    router.push({
      pathname: `/${transaction.transactionHash}`,
      query: { id: transaction.id },
    })
  }

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
        <Address
          address={transaction.transactionHash}
          characters={6}
          copy
          link={transaction.scanUrl}
        />
        <DateTime transactiondate={transaction.timestamp} />
      </TD>
      <TD>
        <BridgeWrapper>
          <Bridge>{transaction.bridgeName}</Bridge>
          <ChainsInitiatorReceiver
            chainIconInitiator={transaction.initiatorNetworkIcon ?? ''}
            chainIconReceiver={transaction.receiverNetworkIcon ?? ''}
            chainInitiator={transaction.initiatorNetwork}
            chainReceiver={transaction.receiverNetwork}
          />
        </BridgeWrapper>
      </TD>
      <TD>
        <InitiatorReceiver
          address={transaction.initiator}
          scanLink={transaction.initiatorScanUrl}
          token={transaction.initiatorTokenData?.name ?? ''}
          tokenIcon={transaction.initiatorTokenData?.logoURI ?? ''}
          tokenValue={transaction.initiatorAmount}
        />
      </TD>
      <TDReceiver>
        <InitiatorReceiver
          address={transaction.receiver}
          scanLink={transaction.receiverScanUrl}
          token={transaction.receiverTokenData?.name ?? ''}
          tokenIcon={transaction.receiverTokenData?.logoURI ?? ''}
          tokenValue={transaction.receiverAmount}
        />
      </TDReceiver>
      <TDStatus>
        <Status status={transaction.transactionStatus} />
      </TDStatus>
      <TDValidators>
        {/* States available: pending, submitted, submittedExecuted, executed, notRequired */}
        <Validators transaction={transaction} />
      </TDValidators>
      <TD>
        <ActionButton
          disabled={transaction.transactionStatus !== 'UNCLAIMED'}
          onClick={(e) => handleClaim(e)}
        >
          Claim
        </ActionButton>
        <ViewMore>View More</ViewMore>
      </TD>
      <TDChevron>
        <ChevronRight />
      </TDChevron>
    </TR>
  )
}
