import { useState } from 'react'

import { Configuration } from '@/src/components/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/components/bridges/DailyBridgeLimits'
import { InterestFunds } from '@/src/components/bridges/InterestFunds'
import { Section } from '@/src/components/layout/Section'
import { TabContent } from '@/src/components/tabs/TabContent'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs } from '@/src/components/tabs/Tabs'
import { TabsWrapper } from '@/src/components/tabs/TabsWrapper'
import { tabs } from '@/src/constants/tabs'

export const Limits: React.FC = () => {
  const [tab, setTab] = useState<string>('bridges')
  const { bridges } = tabs

  return (
    <Section>
      <TabsWrapper>
        <Tabs>
          {bridges.map(({ title }, index) => (
            <TabHeader key={index} onClick={setTab} title={title} />
          ))}
        </Tabs>
      </TabsWrapper>
      {bridges.map(({ href, title }, index) => (
        <TabContent key={index} title={title}>
          {href === '/daily-bridge-limits' && <DailyBridgeLimits />}
          {href === '/interest-funds' && <InterestFunds />}
          {href === '/configuration' && <Configuration />}
        </TabContent>
      ))}
    </Section>
  )
}
