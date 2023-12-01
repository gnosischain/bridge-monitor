import React from 'react'

import { Configuration } from '@/src/pagePartials/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/pagePartials/bridges/DailyBridgeLimits'
// import { InterestFunds } from '@/src/components/bridges/InterestFunds'

interface tabsType {
  [key: string]: Array<{ title: string; contents?: React.ReactNode }>
}

export const tabs: tabsType = {
  bridgeTypes: [
    {
      title: 'xDai',
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
