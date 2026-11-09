import sortBy from 'lodash/sortBy'
import uniqBy from 'lodash/uniqBy'

import { Bridges } from '@/src/constants/config/bridges'
import { useValidators } from '@/src/providers/validatorsProvider'
import { isSameString } from '@/src/utils/tools'

/**
 * `bridge`'s active validators, or both bridges' when none is selected: the same operators run
 * both, so the two lists merge by name. Sorted by name, as the indexer returns them in no stable
 * order.
 */
export const useActiveValidators = (bridge: string) => {
  const { validators: xdai } = useValidators(Bridges.xdai)
  const { validators: amb } = useValidators(Bridges.amb)

  const validators = !bridge ? [...xdai, ...amb] : isSameString(bridge, Bridges.xdai) ? xdai : amb

  return sortBy(
    uniqBy(
      validators.filter((validator) => !validator.removed),
      'name',
    ),
    'name',
  )
}
