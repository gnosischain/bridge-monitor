import React, { useState } from 'react'
import styled from 'styled-components'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import FilterDropdown from '../filters/FilterDropdown'
import { TextfieldCSS } from '../form/Textfield'
import { composeDateTimeFilterValue, dayHoursOptions } from '@/src/utils/date'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;
  gap: ${({ theme: { common } }) => common.space}px;
  font-size: 1.2rem;
  width: 100%;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    flex-direction: row;
    gap: ${({ theme: { common } }) => common.space * 2}px;
    font-size: 1.4rem;
    align-items: center;
    width: auto;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    flex-direction: row;
  }
`
const Column = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  gap: ${({ theme: { common } }) => common.space / 2}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    flex-direction: row;
    gap: ${({ theme: { common } }) => common.space}px;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
  }
`
const Label = styled.span`
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    min-width: 40px;
    display: inline-block;
  }
`
const DatePickerWrapper = styled.div`
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({ theme: { common } }) => common.space}px;
    color: #fff;
    pointer-events: none;
    z-index: 1;
    width: 17px;
    height: 17px;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIHZpZXdCb3g9IjAgMCAxNiAxNyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zLjMzMzM0IDMuODMzMzNDMi45NjUxNSAzLjgzMzMzIDIuNjY2NjggNC4xMzE4MSAyLjY2NjY4IDQuNVYxMy44MzMzQzIuNjY2NjggMTQuMjAxNSAyLjk2NTE1IDE0LjUgMy4zMzMzNCAxNC41SDEyLjY2NjdDMTMuMDM0OSAxNC41IDEzLjMzMzMgMTQuMjAxNSAxMy4zMzMzIDEzLjgzMzNWNC41QzEzLjMzMzMgNC4xMzE4MSAxMy4wMzQ5IDMuODMzMzMgMTIuNjY2NyAzLjgzMzMzSDMuMzMzMzRaTTEuMzMzMzQgNC41QzEuMzMzMzQgMy4zOTU0MyAyLjIyODc3IDIuNSAzLjMzMzM0IDIuNUgxMi42NjY3QzEzLjc3MTIgMi41IDE0LjY2NjcgMy4zOTU0MyAxNC42NjY3IDQuNVYxMy44MzMzQzE0LjY2NjcgMTQuOTM3OSAxMy43NzEyIDE1LjgzMzMgMTIuNjY2NyAxNS44MzMzSDMuMzMzMzRDMi4yMjg3NyAxNS44MzMzIDEuMzMzMzQgMTQuOTM3OSAxLjMzMzM0IDEzLjgzMzNWNC41WiIgZmlsbD0iI0YwRUJERSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEwLjY2NjcgMS4xNjY2OUMxMS4wMzQ5IDEuMTY2NjkgMTEuMzMzMyAxLjQ2NTE2IDExLjMzMzMgMS44MzMzNVY0LjUwMDAyQzExLjMzMzMgNC44NjgyMSAxMS4wMzQ5IDUuMTY2NjkgMTAuNjY2NyA1LjE2NjY5QzEwLjI5ODUgNS4xNjY2OSAxMCA0Ljg2ODIxIDEwIDQuNTAwMDJWMS44MzMzNUMxMCAxLjQ2NTE2IDEwLjI5ODUgMS4xNjY2OSAxMC42NjY3IDEuMTY2NjlaIiBmaWxsPSIjRjBFQkRFIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNS4zMzMzMiAxLjE2NjY5QzUuNzAxNTEgMS4xNjY2OSA1Ljk5OTk5IDEuNDY1MTYgNS45OTk5OSAxLjgzMzM1VjQuNTAwMDJDNS45OTk5OSA0Ljg2ODIxIDUuNzAxNTEgNS4xNjY2OSA1LjMzMzMyIDUuMTY2NjlDNC45NjUxMyA1LjE2NjY5IDQuNjY2NjYgNC44NjgyMSA0LjY2NjY2IDQuNTAwMDJWMS44MzMzNUM0LjY2NjY2IDEuNDY1MTYgNC45NjUxMyAxLjE2NjY5IDUuMzMzMzIgMS4xNjY2OVoiIGZpbGw9IiNGMEVCREUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xLjMzMzM0IDcuMTY2NjdDMS4zMzMzNCA2Ljc5ODQ4IDEuNjMxODIgNi41IDIuMDAwMDEgNi41SDE0QzE0LjM2ODIgNi41IDE0LjY2NjcgNi43OTg0OCAxNC42NjY3IDcuMTY2NjdDMTQuNjY2NyA3LjUzNDg2IDE0LjM2ODIgNy44MzMzMyAxNCA3LjgzMzMzSDIuMDAwMDFDMS42MzE4MiA3LjgzMzMzIDEuMzMzMzQgNy41MzQ4NiAxLjMzMzM0IDcuMTY2NjdaIiBmaWxsPSIjRjBFQkRFIi8+Cjwvc3ZnPgo=');
  }
  .react-datepicker {
    font-size: 1.1rem;
    background-color: ${({ theme }) => theme.colors.darkerGrey};
    border: none;
    box-shadow: 0px 63px 80px rgba(0, 0, 0, 0.07), 0px 31.8937px 34.875px rgba(0, 0, 0, 0.04725),
      0px 12.6px 13px rgba(0, 0, 0, 0.035), 0px 2.75625px 4.625px rgba(0, 0, 0, 0.02275);
  }
  .react-datepicker__month-container {
    background-color: ${({ theme }) => theme.colors.darkerGrey};
    padding-bottom: ${({ theme: { common } }) => common.space}px;
  }
  .react-datepicker__header {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.cream};
    border: none;
    padding: ${({ theme: { common } }) => common.space * 2}px 0
      ${({ theme: { common } }) => common.space}px;
  }
  .react-datepicker-popper[data-placement^='bottom'] .react-datepicker__triangle::before,
  .react-datepicker-popper[data-placement^='bottom'] .react-datepicker__triangle::after {
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
  .react-datepicker__day-name,
  .react-datepicker__day,
  .react-datepicker__time-name {
    margin: 0.5rem;
  }
  .react-datepicker__navigation {
    top: 10px;
  }
  .react-datepicker__current-month,
  .react-datepicker-time__header,
  .react-datepicker-year-header,
  .react-datepicker__day-name,
  .react-datepicker__time-name {
    color: ${({ theme }) => theme.colors.cream};
    font-size: 1.2rem;
  }
  .react-datepicker__day {
    color: ${({ theme }) => theme.colors.creamDark};
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range,
  .react-datepicker__month-text--selected,
  .react-datepicker__month-text--in-selecting-range,
  .react-datepicker__month-text--in-range,
  .react-datepicker__quarter-text--selected,
  .react-datepicker__quarter-text--in-selecting-range,
  .react-datepicker__quarter-text--in-range,
  .react-datepicker__year-text--selected,
  .react-datepicker__year-text--in-selecting-range,
  .react-datepicker__year-text--in-range,
  .react-datepicker__day--keyboard-selected,
  .react-datepicker__month-text--keyboard-selected,
  .react-datepicker__quarter-text--keyboard-selected,
  .react-datepicker__year-text--keyboard-selected {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.darkerGrey};
    font-weight: bold;
  }
  .react-datepicker__day:hover,
  .react-datepicker__month-text:hover,
  .react-datepicker__quarter-text:hover,
  .react-datepicker__year-text:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`
const DatePickerStyle = styled(DatePicker)`
  ${TextfieldCSS}
  width: 120px;
`
type Props = {
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  startDate: Date
  endDate: Date
}

export const DateTimePicker: React.FC<Props> = ({
  endDate,
  onEndDateChange,
  onStartDateChange,
  startDate,
}) => {
  const timeOptions = dayHoursOptions
  const [, setStartTime] = useState<string>(timeOptions[0])
  const [, setEndTime] = useState<string>(timeOptions[0])

  const onSetStartTime = (newStartTime: string) => {
    setStartTime(newStartTime)
    const newStartingDateTime = composeDateTimeFilterValue(startDate, newStartTime)
    onStartDateChange(newStartingDateTime)
  }

  const onSetEndTime = (newEndTime: string) => {
    setEndTime(newEndTime)
    const newEndingDateTime = composeDateTimeFilterValue(endDate, newEndTime)
    onEndDateChange(newEndingDateTime)
  }

  return (
    <Wrapper>
      <Column>
        <Label>From </Label>
        <DatePickerWrapper>
          <DatePickerStyle
            endDate={endDate}
            maxDate={endDate}
            onChange={onStartDateChange}
            selected={startDate}
            selectsStart
          />
        </DatePickerWrapper>
        <FilterDropdown onChange={onSetStartTime} options={timeOptions} />
      </Column>
      <Column>
        <Label>To </Label>
        <DatePickerWrapper>
          <DatePickerStyle
            minDate={startDate}
            onChange={onEndDateChange}
            selected={endDate}
            selectsEnd
            startDate={startDate}
          />
        </DatePickerWrapper>
        <FilterDropdown onChange={onSetEndTime} options={timeOptions} />
      </Column>
    </Wrapper>
  )
}
