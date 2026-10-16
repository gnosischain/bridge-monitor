import { useState } from 'react'
import styled, { withTheme } from 'styled-components'

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFetchValidatorsActivity } from '@/src/hooks/useValidators'
import { genericSuspense } from '@/src/components/safeSuspense'
import { BridgesValues } from '@/src/constants/config/bridges'
import { get1DayBeforeInSeconds, get7DaysBeforeInSeconds } from '@/src/utils/date'
import { Loading } from '@/src/components/loading'
import { TabHeader } from '@/src/pagePartials/bridgeExplorer/common/TabHeader'
import { Tabs } from '@/src/pagePartials/bridgeExplorer/common/Tabs'

const Wrapper = styled.div`
  --chart-min-height: 196px;

  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }
`

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  justify-content: space-between;
`

const Title = styled.h3`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
`

const ChartWrapper = styled.div`
  min-height: var(--chart-min-height);
`

const Spinner = styled(Loading)`
  height: var(--chart-min-height);
`

const TooltipWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.ink};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.surface};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);
`

const TooltipLabel = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.4;
`

const TooltipValue = styled.div`
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip: React.FC<{ active?: boolean; label?: string; payload?: any }> = ({
  active,
  label,
  payload,
}) => {
  return (
    active &&
    payload &&
    payload.length && (
      <TooltipWrapper>
        <TooltipLabel>{label}</TooltipLabel>
        <TooltipValue>Signatures: {payload[0].value}</TooltipValue>
      </TooltipWrapper>
    )
  )
}

const ROW_HEIGHT = 36

// One series, so one colour: the validator's name on the axis says which bar is whose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BaseChart: React.FC<{ timePeriod: number; bridge: string; theme: any }> = genericSuspense(
  ({ bridge, theme, timePeriod }) => {
    const signedTXs = useFetchValidatorsActivity(bridge as BridgesValues, timePeriod, 'signed')

    const data = signedTXs.data.map((item) => ({
      name: item.name,
      value: item.value,
    }))

    const tickStyle = {
      fontFamily: theme.fonts.family,
      fontSize: '1.3rem',
      fontWeight: 500,
      fill: theme.colors.ink,
    }

    return (
      <ChartWrapper style={{ height: data.length * ROW_HEIGHT }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="value" hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={tickStyle}
              tickLine={false}
              type="category"
              width={140}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: theme.colors.page, stroke: 'none' }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar barSize={14} dataKey="value" fill={theme.colors.violet} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="value"
                fill={theme.colors.fog}
                fontFamily={theme.fonts.family}
                fontSize="1.2rem"
                offset={8}
                position="right"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  },
  () => <Spinner />,
)

const Chart = withTheme(BaseChart) as unknown as React.FC<{ bridge: string; timePeriod: number }>

const _1DayBeforeInSeconds = get1DayBeforeInSeconds()
const _1WeekBeforeInSeconds = get7DaysBeforeInSeconds()

export const TransactionsSigned: React.FC<{
  bridge: string
}> = genericSuspense(({ bridge, ...restProps }) => {
  const periods = [
    { title: 'Last day', timestampVal: _1DayBeforeInSeconds },
    { title: 'Last week', timestampVal: _1WeekBeforeInSeconds },
  ]
  const [selectedPeriod, setSelectedPeriod] = useState(0)

  return (
    <Wrapper {...restProps}>
      <Header>
        <Title>Transactions signed</Title>
        <Tabs aria-label="Period" as="div" role="group">
          {periods.map(({ title }, index) => (
            <TabHeader
              $isActive={selectedPeriod === index}
              key={index}
              onClick={() => setSelectedPeriod(index)}
              title={title}
            />
          ))}
        </Tabs>
      </Header>
      <Chart bridge={bridge} timePeriod={periods[selectedPeriod].timestampVal} />
    </Wrapper>
  )
})
