import React from 'react'
import styled from 'styled-components'

import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { genericSuspense } from '@/src/components/helpers/SafeSuspense'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import addDays from 'date-fns/addDays'
import isToday from 'date-fns/isToday'
import isAfter from 'date-fns/isAfter'

const Wrapper = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;
  gap: ${({ theme: { common } }) => common.space}px;
  justify-content: end;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    align-items: center;
    flex-direction: row;
    font-size: 1.4rem;
    gap: ${({ theme: { common } }) => common.space * 2}px;
    width: auto;
  }

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    flex-direction: row;
  }
`

const Column = styled.div`
  align-items: center;
  display: flex;
`

const Label = styled.span`
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    min-width: 40px;
    display: inline-block;
  }
`

const DatePickerStyle = styled(DatePicker)`
  ${TextfieldCSS}
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIHZpZXdCb3g9IjAgMCAxNiAxNyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zLjMzMzM0IDMuODMzMzNDMi45NjUxNSAzLjgzMzMzIDIuNjY2NjggNC4xMzE4MSAyLjY2NjY4IDQuNVYxMy44MzMzQzIuNjY2NjggMTQuMjAxNSAyLjk2NTE1IDE0LjUgMy4zMzMzNCAxNC41SDEyLjY2NjdDMTMuMDM0OSAxNC41IDEzLjMzMzMgMTQuMjAxNSAxMy4zMzMzIDEzLjgzMzNWNC41QzEzLjMzMzMgNC4xMzE4MSAxMy4wMzQ5IDMuODMzMzMgMTIuNjY2NyAzLjgzMzMzSDMuMzMzMzRaTTEuMzMzMzQgNC41QzEuMzMzMzQgMy4zOTU0MyAyLjIyODc3IDIuNSAzLjMzMzM0IDIuNUgxMi42NjY3QzEzLjc3MTIgMi41IDE0LjY2NjcgMy4zOTU0MyAxNC42NjY3IDQuNVYxMy44MzMzQzE0LjY2NjcgMTQuOTM3OSAxMy43NzEyIDE1LjgzMzMgMTIuNjY2NyAxNS44MzMzSDMuMzMzMzRDMi4yMjg3NyAxNS44MzMzIDEuMzMzMzQgMTQuOTM3OSAxLjMzMzM0IDEzLjgzMzNWNC41WiIgZmlsbD0iI0YwRUJERSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEwLjY2NjcgMS4xNjY2OUMxMS4wMzQ5IDEuMTY2NjkgMTEuMzMzMyAxLjQ2NTE2IDExLjMzMzMgMS44MzMzNVY0LjUwMDAyQzExLjMzMzMgNC44NjgyMSAxMS4wMzQ5IDUuMTY2NjkgMTAuNjY2NyA1LjE2NjY5QzEwLjI5ODUgNS4xNjY2OSAxMCA0Ljg2ODIxIDEwIDQuNTAwMDJWMS44MzMzNUMxMCAxLjQ2NTE2IDEwLjI5ODUgMS4xNjY2OSAxMC42NjY3IDEuMTY2NjlaIiBmaWxsPSIjRjBFQkRFIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNS4zMzMzMiAxLjE2NjY5QzUuNzAxNTEgMS4xNjY2OSA1Ljk5OTk5IDEuNDY1MTYgNS45OTk5OSAxLjgzMzM1VjQuNTAwMDJDNS45OTk5OSA0Ljg2ODIxIDUuNzAxNTEgNS4xNjY2OSA1LjMzMzMyIDUuMTY2NjlDNC45NjUxMyA1LjE2NjY5IDQuNjY2NjYgNC44NjgyMSA0LjY2NjY2IDQuNTAwMDJWMS44MzMzNUM0LjY2NjY2IDEuNDY1MTYgNC45NjUxMyAxLjE2NjY5IDUuMzMzMzIgMS4xNjY2OVoiIGZpbGw9IiNGMEVCREUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xLjMzMzM0IDcuMTY2NjdDMS4zMzMzNCA2Ljc5ODQ4IDEuNjMxODIgNi41IDIuMDAwMDEgNi41SDE0QzE0LjM2ODIgNi41IDE0LjY2NjcgNi43OTg0OCAxNC42NjY3IDcuMTY2NjdDMTQuNjY2NyA3LjUzNDg2IDE0LjM2ODIgNy44MzMzMyAxNCA3LjgzMzMzSDIuMDAwMDFDMS42MzE4MiA3LjgzMzMzIDEuMzMzMzQgNy41MzQ4NiAxLjMzMzM0IDcuMTY2NjdaIiBmaWxsPSIjRjBFQkRFIi8+Cjwvc3ZnPgo=');
  background-position: calc(100% - 15px) 50%;
  margin-left: ${({ theme: { common } }) => common.space}px;
  width: 220px;
`

type Props = {
  endDate: Date | null
  onEndDateChange: (date: Date | null) => void
  onStartDateChange: (date: Date) => void
  startDate: Date
}

export const DateTimePicker: React.FC<Props> = genericSuspense(
  ({ endDate, onEndDateChange, onStartDateChange, startDate, ...restProps }) => {
    const onChange: ReactDatePickerProps<never, true>['onChange'] = (range) => {
      const [rangeStart, rangeEnd] = range

      onStartDateChange(startOfDay(rangeStart!))
      onEndDateChange(rangeEnd ? endOfDay(rangeEnd) : null)
    }

    const getMaxDate = () => {
      const now = new Date()

      // when the from seleciton is open, the max date is today.
      if (startDate && endDate) return now

      // if only startDate is selected, sex max date
      const maxrange = addDays(startDate, 2)
      return isAfter(maxrange, now) ? now : maxrange
    }

    return (
      <Wrapper {...restProps}>
        <Column>
          <Label>Dates</Label>
          <DatePickerStyle
            endDate={endDate}
            maxDate={getMaxDate()}
            onChange={onChange}
            selected={startDate}
            selectsRange
            startDate={startDate}
          />
        </Column>
      </Wrapper>
    )
  },
  () => <></>,
)
