import styled from 'styled-components'
import { Section } from '@/src/components/layout/Section'
import { TabContent } from '@/src/components/tabs/TabContent'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs } from '@/src/components/tabs/Tabs'
import { TabsWrapper } from '@/src/components/tabs/TabsWrapper'
import { tabs } from '@/src/constants/tabs'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Loading } from '@/src/components/loading/Loading'

const Spinner = styled(Loading)`
  min-height: 200px;
`

export const Limits: React.FC = () => {
  const { bridges } = tabs

  return (
    <Section>
      <TabsWrapper>
        <Tabs>
          {bridges.map(({ title }, index) => (
            <TabHeader key={index} onClick={() => undefined} title={title} />
          ))}
        </Tabs>
      </TabsWrapper>
      {bridges.map(({ contents, title }, index) => (
        <TabContent key={index} title={title}>
          {contents}
        </TabContent>
      ))}
    </Section>
  )
}

export default genericSuspense(Limits, () => <Spinner />)
