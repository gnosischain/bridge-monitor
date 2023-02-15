import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { Address as BaseAddress } from '@/src/components/token/Address'
import { TransactionDetailsListItem } from '@/src/components/transaction/TransactionDetailsListItem'
import { TransactionFooter } from '@/src/components/transaction/TransactionFooter'
import { TransactionResume } from '@/src/components/transaction/TransactionResume'
import { TransactionValidations } from '@/src/components/transaction/TransactionValidations'
import { TransactionValidator } from '@/src/components/transaction/TransactionValidator'
import { TransactionStatusTypes } from '@/src/constants/types'
// @todo Bring Transaction information from SG
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { dataTx } from '@/src/utils/transaction'

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
  const transactionId = String(router.query?.transaction)
  // @todo fetch transaction by Id from SG

  const messageIDText = `UserRequestForAffirmation method was called (messageId ${dataTx.messageId})`

  // check if a validator signs more than one time.
  // @todo what parameters define a transaction warning state?
  const checkValidatorsSignOneTime = dataTx.validations.filter(
    (item) => item.transaction.length === 2,
  ).length

  /*
    @todo:
    Set parameters to define status
    transactionStatus:
    - "completed" when transaction is completed.
    - "waiting" if it didn't finish.
    - "warning" if there is an error in the process or if it is spending more than expected.
    */
  const { validators: bridgeValidators } = useFetchValidators(dataTx.bridgeName)
  const getValidatorName = (validatorAddress: string) => {
    return (
      bridgeValidators.find((bridgeValidator) => {
        return bridgeValidator.address === validatorAddress
      })?.name ?? ''
    )
  }

  const [transactionStatus, setTransactionStatus] = useState(TransactionStatusTypes.waiting)
  useEffect(() => {
    if (checkValidatorsSignOneTime) setTransactionStatus(TransactionStatusTypes.warning)
    else if (!dataTx.executorAddress) setTransactionStatus(TransactionStatusTypes.waiting)
    else if (dataTx.signaturesCheckedTimestamp && checkValidatorsSignOneTime === 0)
      setTransactionStatus(TransactionStatusTypes.completed)
  }, [checkValidatorsSignOneTime])

  const { getExplorerUrl } = useWeb3Connection()

  return (
    <Wrapper>
      <Head>
        <Title>Transaction</Title>
        <Address
          address={transactionId}
          bigIcons
          characters={6}
          copy
          link={getExplorerUrl(transactionId)}
        />
      </Head>
      <TransactionInformation>
        <TransactionResume
          bridgeName={dataTx.bridgeName}
          initiator={dataTx.initiator}
          initiatorAmount={dataTx.initiatorAmount}
          initiatorName={dataTx.initiatorName}
          initiatorNetwork={dataTx.initiatorNetwork}
          initiatorNetworkIcon={dataTx.initiatorNetworkIcon}
          initiatorTokenIcon={dataTx.initiatorTokenIcon}
          receiver={dataTx.receiver}
          receiverAmount={dataTx.receiverAmount}
          receiverName={dataTx.receiverName}
          receiverNetwork={dataTx.receiverNetwork}
          receiverNetworkIcon={dataTx.receiverNetworkIcon}
          receiverTokenIcon={dataTx.receiverTokenIcon}
          timestampExecution={dataTx.timestampExecution}
          timestampStarted={dataTx.timestampStarted}
          transactionStatus={transactionStatus}
        />
        <TransactionDetails>
          <TransactionDetailsList>
            <TransactionDetailsListItem
              dateCompleted={dataTx.timestampStarted}
              description="User locked an amount of DAI - requireToPassMessage method was called"
              title="Transaction created"
              transactionStatus={transactionStatus}
              waiting={dataTx.timestampStarted ? false : true}
            />
            <TransactionDetailsListItem
              dateCompleted={dataTx.confirmedTimestamp}
              description={messageIDText}
              title="Transaction confirmed"
              transactionStatus={transactionStatus}
              waiting={dataTx.confirmedTimestamp ? false : true}
            />
            <TransactionDetailsListItem
              dateCompleted=""
              description="executeAffirmation method was called"
              title="Bridge validators signatures"
              transactionStatus={transactionStatus}
              waiting={dataTx.validations.length ? false : true}
            >
              {/*@todo if 4 validators didn't sign a transaction can't be completed.*/}
              <TransactionValidations
                fetchValidatorName={getValidatorName}
                validations={dataTx.validations}
              />
            </TransactionDetailsListItem>
            <TransactionDetailsListItem
              dateCompleted=""
              description="executeAffirmation method was called"
              title="Bridge validator execution"
              transactionStatus={transactionStatus}
              waiting={dataTx.timestampExecution ? false : true}
            >
              {dataTx.executorAddress && (
                <ul>
                  <TransactionValidator
                    key={dataTx.executorId}
                    status=""
                    transaction={dataTx.executorTransaction}
                    validator={getValidatorName(dataTx.executorAddress)}
                  />
                </ul>
              )}
            </TransactionDetailsListItem>
            <TransactionDetailsListItem
              dateCompleted={dataTx.signaturesCheckedTimestamp}
              description="The block reward contract is called by the consensus engine to update user's xDAI balance."
              title="Signatures were checked"
              transactionStatus={transactionStatus}
              waiting={dataTx.signaturesCheckedTimestamp ? false : true}
            />
          </TransactionDetailsList>
        </TransactionDetails>
      </TransactionInformation>
      <TransactionFooter />
    </Wrapper>
  )
}
export default Bridges
