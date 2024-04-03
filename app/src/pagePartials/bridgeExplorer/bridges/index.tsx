import { TabHeader } from '@/src/pagePartials/bridgeExplorer/common/TabHeader'
import {
  MainTabsWrapper,
  TabContentInner,
  Tabs,
} from '@/src/pagePartials/bridgeExplorer/common/Tabs'
import { Configuration } from '@/src/pagePartials/bridgeExplorer/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/pagePartials/bridgeExplorer/bridges/DailyBridgeLimits'
import { Fragment, useState } from 'react'
import { MainTitle } from '@/src/components/text/MainTitle'
import { MainCard as Wrapper } from '@/src/components/card/MainCard'

export const Bridges: React.FC = ({ ...restProps }) => {
  const [activeTab, setActiveTab] = useState(0)
  const bridges: Array<{ title: string; contents?: React.ReactNode }> = [
    {
      title: 'Daily bridge limits',
      contents: <DailyBridgeLimits />,
    },
    {
      contents: <Configuration />,
      title: 'Configuration',
    },
  ]

  return (
    <Wrapper {...restProps}>
      <MainTitle>Bridges information</MainTitle>
      <MainTabsWrapper>
        <Tabs>
          {bridges.map(({ title }, index) => (
            <TabHeader
              isActive={activeTab === index}
              key={index}
              onClick={() => setActiveTab(index)}
              title={title}
            />
          ))}
        </Tabs>
        <TabContentInner>
          {bridges.map(({ contents }, index) => (
            <Fragment key={index}>{activeTab === index && contents}</Fragment>
          ))}
        </TabContentInner>
      </MainTabsWrapper>
    </Wrapper>
  )
}
