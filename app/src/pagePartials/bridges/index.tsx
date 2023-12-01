import { Section } from '@/src/components/layout/Section'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs, TabsWrapper } from '@/src/components/tabs/Tabs'
import { tabs } from '@/src/constants/tabs'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { Fragment, useState } from 'react'
import { MainTitle } from '@/src/components/text/MainTitle'
import { Wrapper } from '@/src/components/layout/Wrapper'

export const BridgesInformation: React.FC = ({ ...restProps }) => {
  const { bridges } = tabs
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
        <SafeSuspense>
          {bridges.map(({ contents }, index) => (
            <Fragment key={index}>{activeTab === index && contents}</Fragment>
          ))}
        </SafeSuspense>
      </Section>
    </Wrapper>
  )
}
