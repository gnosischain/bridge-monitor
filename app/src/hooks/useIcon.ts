import { useCallback, useEffect, useState } from 'react'
import { getIcon } from '@/src/utils/icons'

export const useIcon = () => {
  const getIconPath = useCallback((name?: string) => getIcon(name), [])

  return { getIconPath }
}
