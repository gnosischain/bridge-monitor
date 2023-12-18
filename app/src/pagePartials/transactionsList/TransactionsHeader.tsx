import styled from 'styled-components'

import { Tooltip } from '@/src/components/tooltip/Tooltip'
import { Validator } from '@/src/utils/validators'
import { TH, THead } from '@/src/components/common/Table'

const THValidators = styled(TH)`
  background-color: ${({ theme }) => theme.colors.darkerGrey};
  border-top-left-radius: ${({ theme: { common } }) => common.borderRadius};
  border-top-right-radius: ${({ theme: { common } }) => common.borderRadius};
`

const ValidatorNameWrapper = styled.div`
  column-gap: ${({ theme: { common } }) => common.space}px;
  display: flex;
  justify-content: center;
  padding-left: var(--table-padding-common);
  padding-right: var(--table-padding-common);
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
    <THead compact={!validators} {...restProps}>
      <TH>Tx Hash</TH>
      <TH>Bridge Direction</TH>
      <TH>Initiator</TH>
      <TH>&nbsp;</TH>
      <TH>Receiver</TH>
      {validators && (
        <THValidators className="validators">
          <ValidatorNameWrapper>
            {validators.map((validator, index) => (
              <Tooltip content={validator.name} key={`validator_column_${index}`}>
                <ValidatorName>{validator.shortName.toUpperCase()}</ValidatorName>
              </Tooltip>
            ))}
          </ValidatorNameWrapper>
        </THValidators>
      )}
      <TH>Status</TH>
    </THead>
  )
}
