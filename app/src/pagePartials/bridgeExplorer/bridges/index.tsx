import { Fragment, useState } from 'react'
import styled from 'styled-components'
import { PageHeader } from '@/src/components/pageHeader'
import { TabHeader } from '@/src/pagePartials/bridgeExplorer/common/TabHeader'
import { Tabs } from '@/src/pagePartials/bridgeExplorer/common/Tabs'
import { Configuration } from '@/src/pagePartials/bridgeExplorer/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/pagePartials/bridgeExplorer/bridges/DailyBridgeLimits'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 4);
`

export const Bridges: React.FC = ({ ...restProps }) => {
  const [activeTab, setActiveTab] = useState(0)
  const bridges: Array<{ title: string; contents?: React.ReactNode }> = [
    {
      title: 'Daily limits',
      contents: <DailyBridgeLimits />,
    },
    {
      contents: <Configuration />,
      title: 'Configuration',
    },
  ]

  return (
    <Wrapper {...restProps}>
      <PageHeader
        aside={
          <Tabs aria-label="Bridges information">
            {bridges.map(({ title }, index) => (
              <TabHeader
                $isActive={activeTab === index}
                key={index}
                onClick={() => setActiveTab(index)}
                title={title}
              />
            ))}
          </Tabs>
        }
        description="Daily limits and contract addresses of the xDai bridge and the Omnibridge."
        eyebrow="Bridge Explorer"
        title="Bridges information"
      />
      {bridges.map(({ contents }, index) => (
        <Fragment key={index}>{activeTab === index && contents}</Fragment>
      ))}
    </Wrapper>
  )
}
