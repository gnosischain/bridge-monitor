import { useMemo } from 'react'
import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { Tooltip } from '@/src/components/tooltip/Tooltip'
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openLink = (e: any, link: string | undefined) => {
    e.stopPropagation()

    if (link) {
      window.open(link, '_blank', 'noopener noreferrer')
    }
  }

  return (
    <Wrapper {...restProps}>
      {validationsStatus.map(({ name, scanUrl, status }, index) => (
        <Tooltip
          content={
            <>
              <div>Validator: {name}</div>
              <div>
                Status:{' '}
                {status === 'pending'
                  ? 'Pending'
                  : status === 'submitted'
                  ? 'Submitted'
                  : status === 'submittedExecuted'
                  ? 'Submitted + executed'
                  : status === 'executed'
                  ? 'Executed'
                  : status === 'notRequired'
                  ? 'Not Required'
                  : 'Not Required'}
              </div>
            </>
          }
          key={`validator_status_${transaction.id}_${index}`}
        >
          <ValidatorStatus
            onClick={(e) =>
              status === 'notRequired' || status === 'default' || status === 'pending'
                ? undefined
                : openLink(e, scanUrl)
            }
            status={status}
          />
        </Tooltip>
      ))}
    </Wrapper>
  )
}
