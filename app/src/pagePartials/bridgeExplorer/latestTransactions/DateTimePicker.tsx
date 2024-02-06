import React from 'react'
import styled from 'styled-components'

import DatePicker from 'react-datepicker'
import { TexfieldPartsCSS, TextfieldCSS } from '@/src/components/form/Textfield'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'

const Wrapper = styled(DatePicker)`
  ${TextfieldCSS}
  ${TexfieldPartsCSS}

  background-color: ${({ theme: { textField } }) => textField.active.backgroundColor};
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTciIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00LjEzMyAzLjMzM0EuNjY3LjY2NyAwIDAwMy40NjcgNHY5LjMzM2MwIC4zNjguMjk4LjY2Ny42NjYuNjY3aDkuMzM0YS42NjcuNjY3IDAgMDAuNjY2LS42NjdWNGEuNjY3LjY2NyAwIDAwLS42NjYtLjY2N0g0LjEzM3ptLTIgLjY2N2EyIDIgMCAwMTItMmg5LjMzNGEyIDIgMCAwMTIgMnY5LjMzM2EyIDIgMCAwMS0yIDJINC4xMzNhMiAyIDAgMDEtMi0yVjR6IiBmaWxsPSIjM0U2OTU3Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS40NjcuNjY3Yy4zNjggMCAuNjY2LjI5OC42NjYuNjY2VjRBLjY2Ny42NjcgMCAwMTEwLjggNFYxLjMzM2MwLS4zNjguMjk4LS42NjYuNjY3LS42NjZ6TTYuMTMzLjY2N2MuMzY5IDAgLjY2Ny4yOTguNjY3LjY2NlY0YS42NjcuNjY3IDAgMDEtMS4zMzMgMFYxLjMzM2MwLS4zNjguMjk4LS42NjYuNjY2LS42NjZ6TTIuMTMzIDYuNjY3YzAtLjM2OS4yOTktLjY2Ny42NjctLjY2N2gxMmEuNjY3LjY2NyAwIDAxMCAxLjMzM2gtMTJhLjY2Ny42NjcgMCAwMS0uNjY3LS42NjZ6IiBmaWxsPSIjM0U2OTU3Ii8+PC9zdmc+');
  border-color: ${({ theme: { textField } }) => textField.active.backgroundColor};
  background-position: calc(100% - 15px) 50%;
`

type Props = {
  endDate: Date | null
  onEndDateChange: (date: Date) => void
  onStartDateChange: (date: Date) => void
  startDate: Date
}

export const DateTimePicker: React.FC<Props> = ({
  onEndDateChange,
  onStartDateChange,
  startDate,
  ...restProps
}) => {
  const onChange = (date: Date) => {
    onStartDateChange(startOfDay(date))
    onEndDateChange(endOfDay(date))
  }

  return <Wrapper maxDate={new Date()} onChange={onChange} selected={startDate} {...restProps} />
}
