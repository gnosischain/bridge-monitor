import React from 'react'

import { Configuration } from '@/src/components/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/components/bridges/DailyBridgeLimits'
// import { InterestFunds } from '@/src/components/bridges/InterestFunds'

interface tabsType {
  [key: string]: Array<{ title: string; contents?: React.ReactNode }>
}

export const tabs: tabsType = {
  transactions: [
    {
      title: 'xDAI',
    },
    {
      title: 'AMB',
    },
  ],
  bridges: [
    {
      title: 'Daily bridge limits',
      contents: <DailyBridgeLimits />,
    },
    // {
    //   contents: <InterestFunds />,
    //   title: 'Interest funds',
    // },
    {
      contents: <Configuration />,
      title: 'Configuration',
    },
  ],
}
