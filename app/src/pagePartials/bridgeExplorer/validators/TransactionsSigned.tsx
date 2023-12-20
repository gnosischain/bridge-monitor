import { useState } from 'react'
import styled from 'styled-components'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useFetchValidatorsSignatures } from '@/src/hooks/subgraph/useValidators'
import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { Dropdown as BaseDropdown, DropdownItem, DropdownPosition } from '@/src/components/dropdown'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { InnerCard } from '@/src/components/card/InnerCard'
import { BridgesValues } from '@/src/constants/config/bridges'
import { get1DayBeforeInSeconds, get7DaysBeforeInSeconds } from '@/src/utils/date'

const Wrapper = styled(InnerCard)``

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.cream};
  flex-shrink: 0;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 500;
  margin: 0;
`

const Dropdown = styled(BaseDropdown)``

const DropdownButton = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  border-radius: 4px;
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: 30px;
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  height: 42px;
  justify-content: space-between;
  padding: 0 16px;
  transition: opacity 0.15s linear;

  &:active {
    opacity: 0.6;
  }
`

const ChartWrapper = styled.div`
  flex-grow: 1;
  min-height: 196px;
`

const TooltipWrapper = styled.div`
  background-color: #252f2b;
  border-radius: 6px;
  border: none;
  color: #f0ebde;
  font-family: Karla, Arial, sans-serif;
  padding: 10px 15px;
`

const TooltipLabel = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
`

const TooltipValue = styled.div`
  font-size: 1.4rem;
  font-weight: 400;
  margin: 0;
  text-transform: capitalize;
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

export type SignedTXsData = {
  validatorName: string
  signedTxsCount: number
}[]

const Chart: React.FC<{ timePeriod: number; bridge: string }> = genericSuspense(
  ({ bridge, timePeriod }) => {
    const signedTXs = useFetchValidatorsSignatures(bridge as BridgesValues, timePeriod)

    if (!signedTXs.data && signedTXs.error) {
      throw new Error('No data for XDAI Signed Transactions')
    }

    const data =
      signedTXs.data?.map((item) => ({
        validatorName: item.name as string,
        signedTxsCount: item.value as number,
      })) ?? []

    const colors = [
      'rgba(43, 157, 109, 0.6)',
      'rgba(43, 157, 157, 0.6)',
      'rgba(43, 95, 157, 0.6)',
      'rgba(108, 68, 193, 0.6)',
      'rgba(185, 110, 182, 0.6)',
      'rgba(69, 104, 194, 0.6)',
      'rgba(168,58,165,0.6)',
      'rgba(21,62,171,0.6)',
    ]

    const commonAxesStyles = {
      axisLine: false,
      tick: {
        fontFamily: 'Karla, Arial, sans-serif',
        fontWeight: 400,
        fontSize: '1.4rem',
        fill: '#F0EBDE',
      },
      tickLine: false,
      interval: 0,
    }

    return (
      <ChartWrapper>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={data.map(({ signedTxsCount, validatorName }) => ({
              name: validatorName,
              value: signedTxsCount,
            }))}
            layout="vertical"
            margin={{
              top: 0,
              right: 20,
              left: -15,
              bottom: 0,
            }}
          >
            <XAxis dataKey="value" dy={5} type="number" {...commonAxesStyles} />
            <YAxis dataKey="name" dx={-20} type="category" width={130} {...commonAxesStyles} />
            <CartesianGrid horizontal={false} stroke={'rgba(240, 235, 222, 0.08)'} />
            <Bar barSize={12} dataKey="value" fill="#fff" radius={[6, 6, 6, 6]}>
              {data?.map((entry, index) => (
                <Cell fill={colors[index % 20]} key={`cell-${index}`} />
              ))}
            </Bar>
            <Tooltip
              content={<CustomTooltip />}
              contentStyle={{
                backgroundColor: '#252F2B',
                border: 'none',
                borderRadius: '6px',
                color: '#F0EBDE',
                fontFamily: 'Karla, Arial, sans-serif',
                padding: '10px 15px',
              }}
              cursor={false}
              wrapperStyle={{ outline: 'none' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    )
  },
)

const _1DayBeforeInSeconds = get1DayBeforeInSeconds()
const _1WeekBeforeInSeconds = get7DaysBeforeInSeconds()

export const TransactionsSigned: React.FC<{
  bridge: string
}> = genericSuspense(({ bridge, ...restProps }) => {
  const dropdownItems = [
    { title: 'Last day', timestampVal: _1DayBeforeInSeconds },
    { title: 'Last week', timestampVal: _1WeekBeforeInSeconds },
  ]
  const [selectedItem, setSelectedItem] = useState(0)
  const [timePeriod, setTimePeriod] = useState(_1DayBeforeInSeconds)

  const onDropdownItemSelect = (index: number) => {
    setTimePeriod(dropdownItems[index].timestampVal)
    setSelectedItem(index)
  }

  return (
    <Wrapper {...restProps}>
      <Header>
        <Title>Transactions Signed</Title>
        <Dropdown
          dropdownButton={
            <DropdownButton>
              <span>{dropdownItems[selectedItem].title}</span> <ChevronDown />
            </DropdownButton>
          }
          dropdownPosition={DropdownPosition.right}
          items={dropdownItems.map((item, index) => (
            <DropdownItem key={index} onClick={() => onDropdownItemSelect(index)}>
              {item.title}
            </DropdownItem>
          ))}
        />
      </Header>
      <Chart bridge={bridge} timePeriod={timePeriod} />
    </Wrapper>
  )
})
