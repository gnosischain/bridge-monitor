import styled from 'styled-components'

import { TransactionValidator } from './TransactionValidator'
import { TransactionValidation } from '@/src/utils/transactions'

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
  validations: TransactionValidation[]
  fetchValidatorName: (validatorAddress: string) => string
}

export const TransactionValidations: React.FC<Props> = ({ fetchValidatorName, validations }) => {
  const signaturesCount = validations.length
  const signaturesStatus = signaturesCount === 4 ? 'not-required' : 'waiting'
  return (
    <Wrapper>
      {validations.map((validation: TransactionValidation, index) => (
        <TransactionValidator
          key={index}
          status={signaturesStatus}
          transaction={validation}
          validator={fetchValidatorName(validation.validatorAddr)}
        />
      ))}

      <MessageRequired>4 of 7 confirmations required</MessageRequired>
    </Wrapper>
  )
}
