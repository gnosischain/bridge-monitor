import styled from 'styled-components'

import { Tooltip } from '@/src/components/common/Tooltip'
import { useGeneral } from '@/src/providers/generalProvider'
import { Validator } from '@/src/utils/validators'

const SwitchDate = styled.button`
  background-color: ${({ theme: { colors } }) => colors.darkerGrey};
  color: inherit;
  padding: 0 ${({ theme: { common } }) => common.space}px;
  line-height: 1.6;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border: none;
  cursor: pointer;
`

interface Props {
  validators: Validator[]
}

export const TransactionHeader: React.FC<Props> = ({ validators }) => {
  const { isTimeAgo, setIsTimeAgo } = useGeneral()
  const changeFormatDate = () => {
    setIsTimeAgo((current) => !current)
  }
  return (
    <thead>
      <tr>
        <th>Txn Hash</th>
        <th>Bridge</th>
        <th>Initiator</th>
        <th>Receiver</th>
        <th>Status</th>
        <th className="validators validatorsHeader">
          {validators.map((validator, index) => (
            <Tooltip key={`validator_column_${index}`} text={validator.name}>
              <span>{validator.shortName}</span>
            </Tooltip>
          ))}
        </th>
        <th>
          <SwitchDate onClick={changeFormatDate}>{isTimeAgo ? 'Age' : 'Date Time'}</SwitchDate>
        </th>
      </tr>
    </thead>
  )
}
