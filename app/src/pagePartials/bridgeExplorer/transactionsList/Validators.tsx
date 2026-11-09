import { useMemo } from 'react'
import styled from 'styled-components'

import { ValidatorStatus } from '@/src/components/assets/ValidatorStatus'
import { Tooltip } from '@/src/components/tooltip'
import { Transaction } from '@/src/utils/transactions'
import { Validator, getValidationsStatus } from '@/src/utils/validators'
import { useValidators } from '@/src/providers/validatorsProvider'
import { BridgesValues } from '@/src/constants/config/bridges'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  height: 16px;
  justify-content: flex-start;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopWideStart}) {
    justify-content: center;
  }
`

interface Props {
  /** The list's columns, which can hold both bridges' validators. */
  columns: Validator[]
  transaction: Transaction
}

export const Validators: React.FC<Props> = ({ columns, transaction, ...restProps }) => {
  const { validators } = useValidators(transaction.bridgeName as BridgesValues)
  // Matched by name: every row shares the columns, while its statuses come from its own bridge's
  // validators, in that bridge's order. A validator this bridge lacks keeps its column's default.
  const validationsStatus = useMemo(() => {
    const statuses = getValidationsStatus(
      transaction,
      validators.filter((validator) => !validator.removed),
    )

    return columns
      .filter((column) => !column.removed)
      .map((column) => statuses.find(({ name }) => name === column.name) ?? column)
  }, [columns, transaction, validators])

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
              <b>{name}</b>
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
            onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) =>
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
