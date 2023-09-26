import styled from 'styled-components'

import { TransactionRowDetails } from './TransactionRowDetails'
import { TransactionValidation } from '@/src/utils/transactions'

const Wrapper = styled.ul`
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space}px;
  margin: ${({ theme: { common } }) => common.space * 4}px 0 0;
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
        <TransactionRowDetails
          key={index}
          nameValue={fetchValidatorName(validation.validatorAddr)}
          network="gnosis"
          status={signaturesStatus}
          transaction={validation}
        />
      ))}
    </Wrapper>
  )
}
