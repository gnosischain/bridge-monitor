import styled from 'styled-components'

import { Tooltip } from '@/src/components/tooltip'
import { Validator } from '@/src/utils/validators'
import { TH, THead } from '@/src/components/table'

const THValidators = styled(TH)`
  column-gap: var(--theme-common-space);
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const ValidatorName = styled.span`
  --validator-name-size: 16px;

  display: inline-block;
  flex-shrink: 0;
  font-size: 1.2rem;
  height: var(--validator-name-size);
  line-height: 2.2rem;
  text-align: center;
  white-space: nowrap;
  width: var(--validator-name-size);
`

interface Props {
  validators?: Validator[]
}

export const TransactionHeader: React.FC<Props> = ({ validators, ...restProps }) => {
  return (
    <THead $compact={!validators} {...restProps}>
      <TH>Tx Hash</TH>
      <TH>Bridge Direction</TH>
      <TH>Initiator</TH>
      <TH>&nbsp;</TH>
      <TH>Receiver</TH>
      {validators && (
        <THValidators className="validators">
          {validators.filter(validator => !validator.removed).map((validator, index) => (
            <Tooltip content={validator.name} key={`validator_column_${index}`}>
              <ValidatorName>{validator.shortName.toUpperCase()}</ValidatorName>
            </Tooltip>
          ))}
        </THValidators>
      )}
      <TH>Status</TH>
    </THead>
  )
}
