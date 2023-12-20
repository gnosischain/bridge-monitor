import { Section } from '@/src/components/layout/Section'
import { TabHeader } from '@/src/pagePartials/bridgeExplorer/common/TabHeader'
import { Tabs, TabsWrapper } from '@/src/pagePartials/bridgeExplorer/common/Tabs'
import { bridges } from '@/src/constants/tabs'
import { Fragment, useState } from 'react'
import { MainTitle } from '@/src/components/text/MainTitle'
import { MainWrapper as Wrapper } from '@/src/components/layout/MainWrapper'

export const Bridges: React.FC = ({ ...restProps }) => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Wrapper {...restProps}>
      <MainTitle>Bridges information</MainTitle>
      <Section>
        <TabsWrapper>
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
        </TabsWrapper>
        {bridges.map(({ contents }, index) => (
          <Fragment key={index}>{activeTab === index && contents}</Fragment>
        ))}
      </Section>
    </Wrapper>
  )
}
