import type { NextPage } from 'next'

import { Validators, ValidatorsSkeleton } from '@/src/pagePartials/bridgeExplorer/validators'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'

const ValidatorsPage: NextPage = genericSuspense(
  () => {
    return (
      <ValidatorsProvider>
        <Validators />
      </ValidatorsProvider>
    )
  },
  () => <ValidatorsSkeleton />,
)

export default ValidatorsPage
