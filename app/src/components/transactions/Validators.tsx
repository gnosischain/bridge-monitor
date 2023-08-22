import { useMemo } from 'react'
import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { Tooltip } from '@/src/components/common/Tooltip'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { Transaction } from '@/src/utils/transactions'
import { getValidationsStatus } from '@/src/utils/validators'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme: { common } }) => common.space}px;
  height: 2.2rem;
  justify-content: center;
`

interface Props {
  transaction: Transaction
}

export const Validators: React.FC<Props> = ({ transaction }) => {
  const { validators } = useFetchValidators(transaction.bridgeName)
  const validationsStatus = useMemo(
    () => getValidationsStatus(transaction, validators),
    [transaction, validators],
  )
  return (
    <Wrapper>
      {validationsStatus.map((validator, index) => (
        <Tooltip key={`validator_status_${transaction.id}_${index}`} text={validator.name}>
          <a href={validator.scanUrl} rel="noopener noreferrer" target="_blank">
            <ValidatorStatus status={validator.status} />
          </a>
        </Tooltip>
      ))}
    </Wrapper>
  )
}
