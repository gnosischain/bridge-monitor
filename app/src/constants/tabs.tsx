import React from 'react'

import { Configuration } from '@/src/pagePartials/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/pagePartials/bridges/DailyBridgeLimits'

interface Tabs {
  title: string
  contents?: React.ReactNode
}

export const latestTransactions: Array<Tabs> = [
  {
    title: 'xDai',
  },
  {
    title: 'AMB',
  },
]

export const bridges: Array<Tabs> = [
  {
    title: 'Daily bridge limits',
    contents: <DailyBridgeLimits />,
  },
  {
    contents: <Configuration />,
    title: 'Configuration',
  },
]
