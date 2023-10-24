import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { Address as BaseAddress } from '@/src/components/token/Address'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { TransactionDetailsListItem } from '@/src/components/transaction/TransactionDetailsListItem'
import { TransactionFooter } from '@/src/components/transaction/TransactionFooter'
import {
  TransactionSummary,
  TransactionSummaryPlaceholder,
} from '@/src/components/transaction/TransactionSummary'
import { TransactionValidations } from '@/src/components/transaction/TransactionValidations'
import { TransactionRowDetails } from '@/src/components/transaction/TransactionRowDetails'
import { AMB_SIGNATURE_THRESHOLD, XDAI_SIGNATURE_THRESHOLD } from '@/src/constants/misc'
import { useFetchTransactions } from '@/src/hooks/subgraph/useTransactions'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { TransactionExecution, getTxScanUrl } from '@/src/utils/transactions'
import { TransactionStatus } from '@/types/generated/subgraph'
import { getChainIconName } from '@/src/utils/icons'
import { isSameString } from '@/src/utils/tools'
import { Status } from '@/src/components/common/Status'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 6}px;
`

const Head = styled.div``

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.cream};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  line-height: 1.2;
  margin: 0 0 4px;
  opacity: 0.6;
`

const Address = styled(BaseAddress)`
  color: ${({ theme: { colors } }) => colors.cream};
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 2.4rem;
  font-weight: 500;
  line-height: 1;
  margin: 0;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 4rem;
  }
`

const TransactionInformation = styled.article`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
`

const TransactionDetails = styled.div`
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  padding: ${({ theme: { common } }) => common.space * 4}px
    ${({ theme: { common } }) => common.space}px ${({ theme: { common } }) => common.space * 2}px;

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    padding: ${({ theme: { common } }) => common.space * 6}px
      ${({ theme: { common } }) => common.space * 2}px
      ${({ theme: { common } }) => common.space * 3}px;
  }
`

const TransactionDetailsList = styled.ul`
  margin: 0;
  padding: 0;
`

const Bridges: NextPage = ({ ...restProps }) => {
  const router = useRouter()
  const transactionId = String(router.query?.id)
  const { transactions } = useFetchTransactions(
    {},
    {
      // transactionId is txHash in on the network that originated the bridge
      where: { id: transactionId },
    },
  )

  // hack, for some reason TS is not recognizing that transactions[0] can be null
  const currentTx = transactions.length > 0 ? transactions[0] : null
  const txValidations = currentTx?.validations ?? []
  const txExecution = currentTx?.execution ?? ({} as TransactionExecution)
  const { validators: bridgeValidators } = useFetchValidators(currentTx?.bridgeName)

  if (!currentTx) return null

  const hasValidations = (): boolean => {
    return txValidations !== null && txValidations.length >= 1
  }
  const signatureThresholdNotReached = (): boolean => {
    const signatureThreshold =
      currentTx.bridgeName === 'AMB' ? AMB_SIGNATURE_THRESHOLD : XDAI_SIGNATURE_THRESHOLD
    return currentTx.validations?.length !== signatureThreshold
  }
  const hasBeenExecuted = (): boolean => {
    return txExecution !== null && txExecution.id !== undefined
  }

  const isForeignInitiated = (): boolean => currentTx.initiatorNetwork !== 'gnosis'

  const getValidatorName = (validatorAddress: string) => {
    const v = bridgeValidators.find((bridgeValidator) =>
      isSameString(bridgeValidator.address, validatorAddress),
    )

    return v?.name ?? 'unknown'
  }

  return (
    <Wrapper {...restProps}>
      <Head>
        <Title>Transaction</Title>
        <Address
          address={currentTx.transactionHash}
          bigIcons
          characters={6}
          copy
          link={getTxScanUrl(currentTx.transactionHash, currentTx.initiatorNetwork)}
        />
      </Head>
      <TransactionInformation>
        <TransactionSummary
          bridgeName={currentTx.bridgeName}
          initiator={currentTx.initiator}
          initiatorAmount={currentTx.initiatorAmount}
          initiatorName={currentTx.initiator}
          initiatorNetwork={currentTx.initiatorNetwork}
          initiatorNetworkIcon={getChainIconName(currentTx.initiatorNetwork)}
          initiatorToken={currentTx.initiatorToken}
          receiver={currentTx.receiver}
          receiverName={currentTx.receiver}
          receiverNetwork={currentTx.receiverNetwork}
          receiverNetworkIcon={getChainIconName(currentTx.receiverNetwork)}
          timestampExecution={currentTx.execution?.timestamp ?? 0}
          timestampStarted={currentTx.timestamp ?? 0}
          transactionStatus={currentTx.transactionStatus}
        />
        <TransactionDetails>
          <TransactionDetailsList>
            {/* Initiated */}
            <TransactionDetailsListItem
              description={`The user transferred tokens to the bridge.`}
              title="Bridging initiated"
              transactionStatus={TransactionStatus.Initiated}
            >
              <ul>
                <TransactionRowDetails
                  nameValue="Initiated by user"
                  network={currentTx.initiatorNetwork}
                  status={TransactionStatus.Initiated}
                  transaction={currentTx}
                />
              </ul>
            </TransactionDetailsListItem>
            {/* Collecting */}
            {hasValidations() && (
              <TransactionDetailsListItem
                description={`${txValidations.length} of 4 required confirmations.`}
                title="Awaiting consensus"
                transactionStatus={TransactionStatus.Collecting}
                waiting={signatureThresholdNotReached()}
              >
                <TransactionValidations
                  fetchValidatorName={getValidatorName}
                  validations={txValidations}
                />
              </TransactionDetailsListItem>
            )}
            {/* Completed */}
            {isForeignInitiated() && hasBeenExecuted() && (
              <>
                <TransactionDetailsListItem
                  description="The tokens are in the user's address."
                  title="Bridging is complete"
                  transactionStatus={TransactionStatus.Completed}
                  waiting={currentTx.timestamp ? false : true}
                >
                  <ul>
                    <TransactionRowDetails
                      nameValue="Tokens received"
                      network="gnosis"
                      status="not-required"
                      transaction={txExecution}
                    />
                  </ul>
                </TransactionDetailsListItem>
              </>
            )}
            {!isForeignInitiated() && currentTx.execution && (
              <>
                <TransactionDetailsListItem
                  description="Funds should be available on receiver address."
                  title="Tokens Bridged"
                  transactionStatus={currentTx.transactionStatus}
                >
                  <ul>
                    <TransactionRowDetails
                      nameValue="Tokens received"
                      network={currentTx.receiverNetwork}
                      status="not-required"
                      transaction={currentTx.execution}
                    />
                  </ul>
                </TransactionDetailsListItem>
              </>
            )}
            {!isForeignInitiated() &&
              currentTx.transactionStatus === TransactionStatus.Unclaimed &&
              !currentTx.execution && (
                <>
                  <TransactionDetailsListItem
                    description="Claim to unlock your tokens."
                    title="Ready to claim"
                    transactionStatus={TransactionStatus.Unclaimed}
                  >
                    <Status
                      onClick={() => console.log('claim')}
                      status={TransactionStatus.Unclaimed}
                    />
                  </TransactionDetailsListItem>
                </>
              )}
          </TransactionDetailsList>
        </TransactionDetails>
      </TransactionInformation>
      <TransactionFooter />
    </Wrapper>
  )
}

export default genericSuspense(Bridges, ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <Head>
      <Title>Transaction</Title>
      <SkeletonLoading style={{ width: '25%', height: '40px' }} />
    </Head>
    <TransactionInformation>
      <TransactionSummaryPlaceholder />
      <SkeletonLoading style={{ borderRadius: '4px', height: '300px' }} />
    </TransactionInformation>
  </Wrapper>
))
