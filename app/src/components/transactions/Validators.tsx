import { useMemo } from 'react'
import styled from 'styled-components'

import { Tooltip } from '@/src/components/assets/Tooltip'
import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { Transaction } from '@/src/utils/transactions'
import { getValidationsStatus } from '@/src/utils/validators'

const Wrapper = styled.div`
  display: flex;
  height: 22px;
  align-items: center;
  justify-content: center;
  gap: ${({ theme: { common } }) => common.space}px;
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
