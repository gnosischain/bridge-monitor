import Link from 'next/link'
import styled from 'styled-components'

import { motion } from 'framer-motion'

import { DateTime } from '@/src/components/assets/DateTime'
import { ChainsInitiatorReceiver } from '@/src/components/common/ChainsInitiatorReceiver'
import { InitiatorReceiver } from '@/src/components/common/InitiatorReceiver'
import { Status } from '@/src/components/common/Status'
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
    display: flex;
    align-items: center;
    gap: ${({ theme: { common } }) => common.space * 2}px;
  }
`
const Tr = styled.tr`
  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: ${({ theme: { common } }) => common.space / 2}px 0;
    background-color: ${({ theme }) => theme.colors.darkerGrey};
    padding: ${({ theme: { common } }) => common.space}px
      ${({ theme: { common } }) => common.space}px;
    border-radius: ${({ theme: { common } }) => common.borderRadius};
  }

  &:last-child {
    td {
      border-bottom: none;
      &.validators {
        border-bottom-left-radius: ${({ theme: { common } }) => common.borderRadius};
        border-bottom-right-radius: ${({ theme: { common } }) => common.borderRadius};
      }
    }
  }

  td {
    vertical-align: top;
    padding: ${({ theme: { common } }) => common.space * 3}px
      ${({ theme: { common } }) => common.space * 3}px
      ${({ theme: { common } }) => common.space * 3}px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.black};

    &:last-child {
      text-align: right;
      padding: ${({ theme: { common } }) => common.space * 3}px 0 0
        ${({ theme: { common } }) => common.space * 2}px;
    }

    &.status {
      line-height: 0;
      min-width: 114px;
    }

    &.validators {
      background-color: ${({ theme }) => theme.colors.darkerGrey};
      padding: ${({ theme: { common } }) => common.space * 3}px 0;
    }

    @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
      border-bottom: none;
      padding: ${({ theme: { common } }) => common.space}px
        ${({ theme: { common } }) => common.space * 2}px !important;

      &:last-child {
        padding: ${({ theme: { common } }) => common.space}px
          ${({ theme: { common } }) => common.space * 2}px !important;
        flex: 1 1 150px;
      }

      &.receiver {
        display: none;
      }
    }

    @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      &.receiver {
        flex-basis: 100%;
        height: 0;
        width: 0;
        padding: 0 !important;
        overflow: hidden;
        display: block;
      }
    }
  }
`
const TransactionLink = styled.a`
  display: inline-block;
  text-decoration: none;
`

interface Props {
  transaction: Transaction
}

export const TransactionRow: React.FC<Props> = ({ transaction }) => {
  return (
    <>
      <Tr
        animate={{ y: 0, opacity: 1 }}
        as={motion.tr}
        exit={{ y: 10, opacity: 0 }}
        initial={{ y: -5, opacity: 0 }}
        key={transaction.id}
        transition={{ duration: 0.4 }}
      >
        <td>
          <Address address={transaction.transactionHash} copy link={transaction.scanUrl} />
        </td>
        <td>
          <BridgeWrapper>
            <Bridge>{transaction.bridgeName}</Bridge>
            <ChainsInitiatorReceiver
              chainIconInitiator={transaction.initiatorNetworkIcon ?? ''}
              chainIconReceiver={transaction.receiverNetworkIcon ?? ''}
              chainInitiator={transaction.initiatorNetwork}
              chainReceiver={transaction.receiverNetwork}
            />
          </BridgeWrapper>
        </td>
        <td>
          <InitiatorReceiver
            address={transaction.initiator}
            scanLink={transaction.initiatorScanUrl}
            token={transaction.initiatorTokenData?.name ?? ''}
            tokenIcon={transaction.initiatorTokenData?.logoURI ?? ''}
            tokenValue={transaction.initiatorAmount}
          />
        </td>
        <td className="receiver">
          <InitiatorReceiver
            address={transaction.receiver}
            scanLink={transaction.receiverScanUrl}
            token={transaction.receiverTokenData?.name ?? ''}
            tokenIcon={transaction.receiverTokenData?.logoURI ?? ''}
            tokenValue={transaction.receiverAmount}
          />
        </td>
        <td className="status">
          {/* States available: pending, completed */}
          <Link href={`/${transaction.id}`} passHref>
            <TransactionLink>
              <Status status={transaction.transactionStatus} />
            </TransactionLink>
          </Link>
        </td>
        <td className="validators">
          {/* States available: pending, submitted, submittedExecuted, executed, notRequired */}
          <Validators transaction={transaction} />
        </td>
        <td>
          <DateTime transactiondate={transaction.timestamp} />
        </td>
      </Tr>
    </>
  )
}
