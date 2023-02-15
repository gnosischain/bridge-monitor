import styled from 'styled-components'

import { TransactionValidator } from './TransactionValidator'

const Wrapper = styled.ul`
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space}px;
  margin: ${({ theme: { common } }) => common.space * 4}px 0 0;
`

const MessageRequired = styled.small`
  display: inline-block;
  font-weight: 300;
  opacity: 0.8;
  padding-top: ${({ theme: { common } }) => common.space * 4}px;
`

interface Props {
  validations: {
    id: string
    validatorAddress: string
    transaction: { timestamp: string; transactionHash: string }[]
  }[]
  fetchValidatorName: (validatorAddress: string) => string
}

export const TransactionValidations: React.FC<Props> = ({ fetchValidatorName, validations }) => {
  // @todo:
  const countSignatures = validations.filter(
    (obj: { transaction: { timestamp: string; transactionHash: string }[] }) =>
      obj.transaction[0].transactionHash,
  ).length
  let signaturesStatus = ''
  if (countSignatures === 4) {
    signaturesStatus = 'not-required'
  }
  return (
    <Wrapper>
      {validations.map(
        (
          validation: {
            id: string
            transaction: { timestamp: string; transactionHash: string }[]
            validatorAddress: string
          },
          index,
        ) => (
          <TransactionValidator
            key={index}
            status={signaturesStatus}
            transaction={validation.transaction}
            validator={fetchValidatorName(validation.validatorAddress)}
          />
        ),
      )}

      <MessageRequired>4 of 6 confirmations required</MessageRequired>
    </Wrapper>
  )
}
