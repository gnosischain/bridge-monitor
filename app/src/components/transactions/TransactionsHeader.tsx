import { Tooltip } from '@/src/components/assets/Tooltip'
import { Validator } from '@/src/utils/validators'

interface Props {
  validators: Validator[]
}

export const TransactionHeader: React.FC<Props> = ({ validators }) => {
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
        <th>Time</th>
      </tr>
    </thead>
  )
}
