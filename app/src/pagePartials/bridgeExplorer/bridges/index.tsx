import styled from 'styled-components'
import { PageHeader } from '@/src/components/pageHeader'
import { Eyebrow } from '@/src/components/text/Eyebrow'
import { Configuration } from '@/src/pagePartials/bridgeExplorer/bridges/Configuration'
import { DailyBridgeLimits } from '@/src/pagePartials/bridgeExplorer/bridges/DailyBridgeLimits'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 4);
`

const Group = styled.section`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  margin: 0;
`

export const Bridges: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <PageHeader
      description="Daily limits and contract addresses of the xDai bridge and the Omnibridge."
      eyebrow="Bridge Explorer"
      title="Bridges information"
    />
    <Group>
      <Eyebrow as="h2">Daily limits</Eyebrow>
      <DailyBridgeLimits />
    </Group>
    <Divider />
    <Group>
      <Eyebrow as="h2">Contract addresses</Eyebrow>
      <Configuration />
    </Group>
  </Wrapper>
)
