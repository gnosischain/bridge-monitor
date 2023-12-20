import styled from 'styled-components'

import { TransactionRowDetails } from './TransactionRowDetails'
import { TransactionValidation } from '@/src/utils/transactions'
import { ValidatorIcon } from '@/src/pagePartials/bridgeExplorer/common/ValidatorIcon'

const Wrapper = styled.ul`
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--theme-common-space);
  margin: calc(var(--theme-common-space) * 4) 0 0;
`

interface Props {
  validations: TransactionValidation[]
  fetchValidatorName: (validatorAddress: string) => { name: string; shortName: string }
}

export const TransactionValidations: React.FC<Props> = ({ fetchValidatorName, validations }) => {
  const signaturesCount = validations.length
  const signaturesStatus = signaturesCount === 4 ? 'not-required' : 'waiting'

  return (
    <Wrapper>
      {validations.map((validation: TransactionValidation, index) => {
        const validator = fetchValidatorName(validation.validatorAddr)

        return (
          <TransactionRowDetails
            icon={
              <ValidatorIcon shortName={validator.shortName} size="18px" title={validator.name} />
            }
            key={index}
            network="gnosis"
            status={signaturesStatus}
            title={validator.name}
            transaction={validation}
          />
        )
      })}
    </Wrapper>
  )
}
