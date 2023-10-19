import { Section } from '@/src/components/layout/Section'
import { TabContent } from '@/src/components/tabs/TabContent'
import { TabHeader } from '@/src/components/tabs/TabHeader'
import { Tabs } from '@/src/components/tabs/Tabs'
import { TabsWrapper } from '@/src/components/tabs/TabsWrapper'
import { tabs } from '@/src/constants/tabs'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import styled from 'styled-components'
import { Loading } from '@/src/components/loading/Loading'

const Spinner = styled(Loading)`
  margin: auto;
`

const Contents: React.FC<{ contents: React.ReactNode; title: string }> = genericSuspense(
  ({ contents, title }) => {
    return <TabContent title={title}>{contents}</TabContent>
  },
  () => <Spinner />,
)

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
        <Contents contents={contents} key={index} title={title} />
      ))}
    </Section>
  )
}
