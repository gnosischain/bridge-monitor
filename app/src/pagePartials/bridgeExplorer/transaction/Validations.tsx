import { DetailsList, DetailsRow } from '@/src/pagePartials/bridgeExplorer/transaction/DetailsRow'
import { TransactionValidation } from '@/src/utils/transactions'
import { ValidatorIcon } from '@/src/pagePartials/bridgeExplorer/common/ValidatorIcon'

interface Props {
  fetchValidatorName: (validatorAddress: string) => { name: string; shortName: string }
  validations: TransactionValidation[]
}

export const Validations: React.FC<Props> = ({ fetchValidatorName, validations }) => {
  return (
    <DetailsList>
      {validations.map((validation: TransactionValidation, index) => {
        const validator = fetchValidatorName(validation.validatorAddr)

        return (
          <DetailsRow
            icon={
              <ValidatorIcon shortName={validator.shortName} size="18px" title={validator.name} />
            }
            key={index}
            network="gnosis"
            title={validator.name}
            transaction={validation}
          />
        )
      })}
    </DetailsList>
  )
}
