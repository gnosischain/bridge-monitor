import { ObjectValues } from '@/types/utils'

export const Bridges = {
  xdai: 'XDAI',
  amb: 'AMB',
  omni: 'OMNIBRIDGE',
} as const

export type BridgesValues = ObjectValues<typeof Bridges>
export type BridgesKeys = keyof typeof Bridges
