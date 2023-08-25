import styled from 'styled-components'

import { Tooltip } from '@/src/components/common/Tooltip'
import { Validator } from '@/src/utils/validators'

const THead = styled.thead`
  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    display: none;
  }
`

const TH = styled.th`
  --th-padding-vertical: ${({ theme: { common } }) => common.space * 3}px;
  --th-padding-horizontal: ${({ theme: { common } }) => common.space * 2}px;

  font-size: 1.4rem;
  font-weight: 300;
  padding: var(--th-padding-vertical) var(--th-padding-horizontal);
  text-align: left;
  vertical-align: top;

  @media (max-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    display: none;
  }
`

const THValidators = styled(TH)`
  background-color: ${({ theme }) => theme.colors.darkerGrey};
  border-top-left-radius: ${({ theme: { common } }) => common.borderRadius};
  border-top-right-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  justify-content: center;
  padding-right: 0;
`

const ValidatorName = styled.span`
  display: inline-block;
  font-size: 1.2rem;
  line-height: 2.2rem;
  text-align: center;
  width: 24px;
`

const THActions = styled(TH)`
  text-align: center;
`

const THLast = styled(TH)``

interface Props {
  validators: Validator[]
}

export const TransactionHeader: React.FC<Props> = ({ validators }) => {
  return (
    <THead>
      <tr>
        <TH>Tx Hash</TH>
        <TH>Bridge</TH>
        <TH>Initiator</TH>
        <TH>Receiver</TH>
        <TH>Status</TH>
        <THValidators className="validators">
          {validators.map((validator, index) => (
            <Tooltip key={`validator_column_${index}`} text={validator.name}>
              <ValidatorName>{validator.shortName}</ValidatorName>
            </Tooltip>
          ))}
        </THValidators>
        <THActions>Actions</THActions>
        <THLast>&nbsp;</THLast>
      </tr>
    </THead>
  )
}
