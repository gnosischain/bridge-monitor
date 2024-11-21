import styled from 'styled-components'

import { DetailsRow } from '@/src/pagePartials/bridgeExplorer/transaction/DetailsRow'
import { TransactionValidation } from '@/src/utils/transactions'
import { ValidatorIcon } from '@/src/pagePartials/bridgeExplorer/common/ValidatorIcon'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: calc(var(--theme-common-space) * 4) 0 0;
  row-gap: var(--theme-common-space);
`

interface Props {
  fetchValidatorName: (validatorAddress: string) => { name: string; shortName: string }
  validations: TransactionValidation[]
}

export const Validations: React.FC<Props> = ({ fetchValidatorName, validations }) => {
  console.log('validations', validations)
  return (
    <Wrapper>
      {validations.map((validation: TransactionValidation, index) => {
        const validator = fetchValidatorName(validation.validatorAddr)

        return (
          <DetailsRow
            icon={
              <ValidatorIcon shortName={validator.shortName} size="18px" title={validator.name} />
            }
            key={index}
            network="gnosis"
            title={validator.name}
            transaction={validation}
          />
        )
      })}
    </Wrapper>
  )
}
