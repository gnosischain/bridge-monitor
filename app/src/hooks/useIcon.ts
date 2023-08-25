import { useMemo } from 'react'
import { getIcon } from '@/src/utils/icons'

export const useIcon = (name?: string) => {
  const iconPath = useMemo(() => getIcon(name), [name])

  return { iconPath }
}
