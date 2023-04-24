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

import { ChevronDown } from '@/src/components/assets/ChevronDown'
import {
  Dropdown as BaseDropdown,
  DropdownItem,
  DropdownPosition,
} from '@/src/components/common/Dropdown'
import { InnerCard } from '@/src/components/common/InnerCard'

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
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  height: 42px;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  transition: opacity 0.15s linear;

  &:active {
    opacity: 0.6;
  }
`

const ChartWrapper = styled.div`
  flex-grow: 1;
  min-height: 196px;
`

export const weekAgoTimestamp = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime() / 1000
}

const monthAgoTimestamp = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime() / 1000
}
const yearAgoTimestamp = () => {
  const now = new Date()
  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime() / 1000
}
const allTimeTimestamp = () => {
  const now = new Date()
  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime() / 1000
}

type SignedTXsData = {
  validatorName: string
  signedTxsCount: number
}[]
export const TransactionsSigned: React.FC<{
  data: SignedTXsData
  onTimePeriodChange: (timePeriod: number) => void
}> = ({ data, onTimePeriodChange, ...restProps }) => {
  const dropdownItems = [
    { title: 'Last week', timestampVal: weekAgoTimestamp() },
    { title: 'Last month', timestampVal: monthAgoTimestamp() },
    { title: 'Last year', timestampVal: yearAgoTimestamp() },
    { title: 'All time', timestampVal: allTimeTimestamp() },
  ]
  const [selectedItem, setSelectedItem] = useState(0)

  const onDropdownItemSelect = (index: number) => {
    onTimePeriodChange(dropdownItems[index].timestampVal)
    setSelectedItem(index)
  }

  const colors = [
    'rgba(43, 157, 109, 0.6)',
    'rgba(43, 157, 157, 0.6)',
    'rgba(43, 95, 157, 0.6)',
    'rgba(108, 68, 193, 0.6)',
    'rgba(185, 110, 182, 0.6)',
    'rgba(69, 104, 194, 0.6)',
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
      <ChartWrapper>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 0,
              right: 10,
              left: 0,
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
              contentStyle={{
                backgroundColor: '#252F2B',
                border: 'none',
                borderRadius: '6px',
                color: '#F0EBDE',
                fontFamily: 'Karla, Arial, sans-serif',
                padding: '10px 15px',
              }}
              cursor={false}
              itemStyle={{
                fontSize: '1.4rem',
                fontWeight: '400',
                margin: '0',
                textTransform: 'capitalize',
              }}
              labelStyle={{
                fontSize: '1.4rem',
                fontWeight: '700',
                margin: '0',
              }}
              wrapperStyle={{ outline: 'none' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </Wrapper>
  )
}
