import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Address as BaseAddress } from '@/src/components/token/Address'
import { ClaimButton as BaseClaimButton } from '@/src/pagePartials/latestTransactions/ClaimButton'
import { TransactionDetailsListItem } from '@/src/pagePartials/transaction/TransactionDetailsListItem'
import {
  TransactionSummary,
  TransactionSummaryPlaceholder,
} from '@/src/pagePartials/transaction/TransactionSummary'
import { TransactionValidations } from '@/src/pagePartials/transaction/TransactionValidations'
import { DelayWarning } from '@/src/pagePartials/transaction/DelayWarning'
import { TransactionRowDetails } from '@/src/pagePartials/transaction/TransactionRowDetails'
import { useFetchTransactions } from '@/src/hooks/subgraph/useTransactions'
import { TransactionExecution, getTxScanUrl } from '@/src/utils/transactions'
import { TransactionStatus } from '@/types/generated/subgraph'
import { getChainIconName } from '@/src/utils/icons'
import { isSameString } from '@/src/utils/tools'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'
import { Wrapper } from '@/src/components/layout/Wrapper'
import { ButtonGoBack } from '@/src/components/buttons/ButtonGoBack'
import { GenericError } from '@/src/components/common/GenericError'
import Link from 'next/link'

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  line-height: 1.2;
  margin: 0 0 4px;
  opacity: 0.6;
`

const Address = styled(BaseAddress)`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 2.4rem;
  font-weight: 500;
  line-height: 1;
  margin: 0;
  text-transform: uppercase;

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

const ClaimButton = styled(BaseClaimButton)`
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    display: inline-block;
  }
`

export const TransactionSkeletonLoading: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <Head>
      <div>
        <Title>Transaction</Title>
        <SkeletonLoading style={{ width: '460px', height: '48px', maxWidth: '100%' }} />
      </div>
    </Head>
    <TransactionInformation>
      <TransactionSummaryPlaceholder />
      <SkeletonLoading style={{ borderRadius: '4px', height: '300px' }} />
    </TransactionInformation>
  </Wrapper>
)

export const Transaction: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const transactionId = String(router.query?.transaction)
  const goBackButtonEnabled = String(router.query?.goBackButtonEnabled) === 'true'

  const { isLoading, transactions, updateInMemoryTransaction } = useFetchTransactions(
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
  const { validators: bridgeValidators } = useValidators(currentTx?.bridgeName as BridgesValues)

  if ((!currentTx && isLoading) || isLoading) return <TransactionSkeletonLoading />
  if (!currentTx)
    return (
      <GenericError
        text={
          <>
            Sorry, but the transaction you're looking for doesn't seem to exist. Maybe there's an
            error in the transaction's hash, or the system is still processing it.
            <br />
            <br />
            Please double-check the URL for any typos or try searching the transaction again from{' '}
            <Link href="/">the homepage</Link>.
          </>
        }
        title="Transaction Not Found"
      />
    )

  const hasValidations = (): boolean => {
    return txValidations !== null && txValidations.length >= 1
  }

  const hasBeenExecuted = (): boolean => {
    return txExecution !== null && txExecution.id !== undefined
  }

  const isForeignInitiated = (): boolean => currentTx.initiatorNetwork !== 'gnosis'

  const getValidatorName = (validatorAddress: string) => {
    const v = bridgeValidators.find((bridgeValidator) =>
      isSameString(bridgeValidator.address, validatorAddress),
    )

    return v?.name && v?.shortName
      ? { name: v?.name, shortName: v?.shortName }
      : { name: 'unknown', shortName: 'unknown' }
  }

  const bridgingComplete = isForeignInitiated() && hasBeenExecuted()
  const tokensBridged = !isForeignInitiated() && currentTx.execution
  const readyToClaim =
    !isForeignInitiated() &&
    currentTx.transactionStatus === TransactionStatus.Unclaimed &&
    !currentTx.execution
  const hasMinimumConsensus = hasValidations()
  const consensusAchieved = txValidations.length === 4

  return (
    <Wrapper {...restProps}>
      <Head>
        <div>
          <Title>Transaction</Title>
          <Address
            address={currentTx.transactionHash}
            bigIcons
            characters={7}
            copy
            link={getTxScanUrl(currentTx.transactionHash, currentTx.initiatorNetwork)}
          />
        </div>
        {goBackButtonEnabled && <ButtonGoBack onClick={() => router.back()} />}
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
          transaction={currentTx}
          transactionStatus={currentTx.transactionStatus}
          updateInMemoryTransaction={updateInMemoryTransaction}
        />
        <TransactionDetails>
          <TransactionDetailsList>
            <TransactionDetailsListItem
              description={`The user transferred tokens to the bridge.`}
              statusIcon="success"
              title="Bridging initiated"
              transactionStatus={TransactionStatus.Initiated}
            >
              <ul>
                <TransactionRowDetails
                  network={currentTx.initiatorNetwork}
                  status={TransactionStatus.Initiated}
                  title="Initiated by user"
                  transaction={currentTx}
                />
              </ul>
              {!hasMinimumConsensus && (
                <DelayWarning
                  initiatorNetwork={currentTx.initiatorNetwork}
                  receiverNetwork={currentTx.receiverNetwork}
                />
              )}
            </TransactionDetailsListItem>
            {hasMinimumConsensus && (
              <TransactionDetailsListItem
                description={`${txValidations.length} of 4 required confirmations.`}
                statusIcon={consensusAchieved ? 'success' : 'waiting'}
                title={consensusAchieved ? 'Consensus achieved' : 'Awaiting consensus'}
                transactionStatus={TransactionStatus.Collecting}
              >
                <TransactionValidations
                  fetchValidatorName={getValidatorName}
                  validations={txValidations}
                />
              </TransactionDetailsListItem>
            )}
            {bridgingComplete && (
              <TransactionDetailsListItem
                description="The tokens are in the user's address."
                statusIcon="success"
                title="Bridging complete"
                transactionStatus={TransactionStatus.Completed}
              >
                <ul>
                  <TransactionRowDetails
                    network="gnosis"
                    status="not-required"
                    title="Tokens received"
                    transaction={txExecution}
                  />
                </ul>
              </TransactionDetailsListItem>
            )}
            {tokensBridged && (
              <TransactionDetailsListItem
                description="Funds should be available on receiver address."
                statusIcon="success"
                title="Tokens bridged"
                transactionStatus={currentTx.transactionStatus}
              >
                {currentTx.execution && (
                  <ul>
                    <TransactionRowDetails
                      network={currentTx.receiverNetwork}
                      status="not-required"
                      title="Tokens received"
                      transaction={currentTx.execution}
                    />
                  </ul>
                )}
              </TransactionDetailsListItem>
            )}
            {readyToClaim && (
              <TransactionDetailsListItem
                description="Claim to unlock your tokens."
                statusIcon="waiting"
                title="Ready to claim"
                transactionStatus={TransactionStatus.Unclaimed}
              >
                <ClaimButton
                  transaction={currentTx}
                  updateInMemoryTransaction={updateInMemoryTransaction}
                />
              </TransactionDetailsListItem>
            )}
          </TransactionDetailsList>
        </TransactionDetails>
      </TransactionInformation>
    </Wrapper>
  )
}
