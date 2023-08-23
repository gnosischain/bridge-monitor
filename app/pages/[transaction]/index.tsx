import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import styled from 'styled-components'

import { Address as BaseAddress } from '@/src/components/token/Address'
import { TransactionDetailsListItem } from '@/src/components/transaction/TransactionDetailsListItem'
import { TransactionFooter } from '@/src/components/transaction/TransactionFooter'
import { TransactionResume } from '@/src/components/transaction/TransactionResume'
import { TransactionValidations } from '@/src/components/transaction/TransactionValidations'
import { TransactionValidator } from '@/src/components/transaction/TransactionValidator'
import { AMB_SIGNATURE_THRESHOLD, XDAI_SIGNATURE_THRESHOLD } from '@/src/constants/misc'
import { useFetchTransactions } from '@/src/hooks/subgraph/useTransactions'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { TransactionExecution, getTxScanUrl } from '@/src/utils/transactions'
import { TransactionStatus } from '@/types/generated/subgraph'
import { getChainIconName } from '@/src/utils/icons'

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
  font-size: 4rem;
  font-weight: 500;
  line-height: 1;
  margin: 0;
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

const Bridges: NextPage = () => {
  const router = useRouter()
  const transactionId = String(router.query?.id)
  // @todo fetch transaction by Id from SG
  const { transactions } = useFetchTransactions({
    where: { id: transactionId },
  })
  const currentTx = transactions?.[0]

  const txValidations = currentTx.validations ?? []
  const hasValidations = (): boolean => {
    return txValidations !== null && txValidations.length >= 1
  }
  const signatureThresholdNotReached = (): boolean => {
    const signatureThreshold =
      currentTx.bridgeName === 'AMB' ? AMB_SIGNATURE_THRESHOLD : XDAI_SIGNATURE_THRESHOLD
    return currentTx.validations?.length !== signatureThreshold
  }
  const txExecution = currentTx.execution ?? ({} as TransactionExecution)
  const hasBeenExecuted = (): boolean => {
    return txExecution !== null && txExecution.id !== undefined
  }
  const hasBeenCompleted = (): boolean => {
    return currentTx.transactionStatus === TransactionStatus.Completed
  }

  const messageIDText = '' // @todo remove it after sg deploys and Transaction entity contains messageId
  // const messageIDText = currentTx.messageId ? `ID for tx ${currentTx.messageId})` : ''

  /*
    @todo:
    Set parameters to define status
    transactionStatus:
    - "completed" when transaction is completed.
    - "waiting" if it didn't finish.
    - "warning" if there is an error in the process or if it is spending more than expected.
    */
  const { validators: bridgeValidators } = useFetchValidators(currentTx.bridgeName)
  const getValidatorName = (validatorAddress: string) => {
    return (
      bridgeValidators.find((bridgeValidator) => {
        return bridgeValidator.address === validatorAddress
      })?.name ?? ''
    )
  }

  // @todo define TransactionStatusType using dropdown options style
  const [transactionStatus, setTransactionStatus] = useState(currentTx.transactionStatus)

  return (
    <Wrapper>
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
        {currentTx.receiverTokenData?.name}
        <TransactionResume
          bridgeName={currentTx.bridgeName}
          initiator={currentTx.initiator}
          initiatorAmount={currentTx.initiatorAmount}
          initiatorName={currentTx.initiator}
          initiatorNetwork={currentTx.initiatorNetwork}
          initiatorNetworkIcon={getChainIconName(currentTx.initiatorNetwork)}
          initiatorTokenIcon={currentTx.initiatorTokenData?.name}
          initiatorTokenName={currentTx.initiatorTokenData?.name ?? ''}
          receiver={currentTx.receiver}
          receiverAmount={currentTx.receiverAmount}
          receiverName={currentTx.receiver}
          receiverNetwork={currentTx.receiverNetwork}
          receiverNetworkIcon={getChainIconName(currentTx.receiverNetwork)}
          receiverTokenIcon={currentTx.receiverTokenData?.name}
          receiverTokenName={currentTx.receiverTokenData?.name ?? ''}
          timestampExecution={currentTx.execution?.timestamp ?? 0}
          timestampStarted={currentTx.timestamp ?? 0}
          transactionStatus={transactionStatus}
        />
        <TransactionDetails>
          <TransactionDetailsList>
            <TransactionDetailsListItem
              dateCompleted={currentTx.timestamp} // tokens bridging initiated / user transfer timestamp
              description={`User locked/minted ${currentTx.initiatorTokenData?.name} tokens.`}
              title="Transaction Created"
              transactionStatus={TransactionStatus.Initiated}
              waiting={currentTx.timestamp ? false : true}
            />
            <TransactionDetailsListItem
              dateCompleted={currentTx.timestamp} // user request event timestamp
              description={`User requested for Signature/Affirmation.
              ${messageIDText}`}
              title="Transaction Confirmed"
              transactionStatus={TransactionStatus.Requested}
              waiting={currentTx.validations?.length === 0}
            ></TransactionDetailsListItem>
            {hasValidations() && (
              <>
                <TransactionDetailsListItem
                  dateCompleted={currentTx.timestamp} // first signature timestamp (COLLECTING initiated)
                  description="Collecting signatures for Transaction validation"
                  title="Bridge Validators Signatures"
                  transactionStatus={TransactionStatus.Collecting}
                  waiting={signatureThresholdNotReached()}
                >
                  <TransactionValidations
                    fetchValidatorName={getValidatorName}
                    validations={txValidations}
                  />
                </TransactionDetailsListItem>
              </>
            )}
            {hasBeenExecuted() && (
              <>
                <TransactionDetailsListItem
                  dateCompleted={currentTx.timestamp} // last signature timestamp (UNCLAIMED)
                  description="Signatures treshold has been reached. Last Validator signing"
                  title="Bridge Validator Execution"
                  transactionStatus={TransactionStatus.Unclaimed}
                  waiting={currentTx.timestamp ? false : true}
                >
                  <ul>
                    <TransactionValidator
                      key={txExecution.id}
                      status="not-required"
                      transaction={txExecution}
                      validator={getValidatorName(txExecution.responsableAddress)}
                    />
                  </ul>
                </TransactionDetailsListItem>
              </>
            )}
            {hasBeenCompleted() && (
              <>
                <TransactionDetailsListItem
                  dateCompleted={currentTx.timestamp} // tokens bridged event timestamp (COMPLETED)
                  description="Funds should be available on receiver address"
                  title="Tokens Bridged"
                  transactionStatus={transactionStatus}
                  waiting={currentTx.timestamp ? false : true}
                ></TransactionDetailsListItem>
              </>
            )}
          </TransactionDetailsList>
        </TransactionDetails>
      </TransactionInformation>
      <TransactionFooter />
    </Wrapper>
  )
}
export default Bridges
