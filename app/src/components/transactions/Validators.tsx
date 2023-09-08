import { useMemo } from 'react'
import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { Tooltip } from '@/src/components/common/Tooltip'
import { useFetchValidators } from '@/src/hooks/subgraph/useValidators'
import { Transaction } from '@/src/utils/transactions'
import { getValidationsStatus } from '@/src/utils/validators'

const Wrapper = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
  height: 16px;
`

interface Props {
  transaction: Transaction
}

export const Validators: React.FC<Props> = ({ transaction, ...restProps }) => {
  const { validators } = useFetchValidators(transaction.bridgeName)
  const validationsStatus = useMemo(
    () => getValidationsStatus(transaction, validators),
    [transaction, validators],
  )
  return (
    <Wrapper {...restProps}>
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
