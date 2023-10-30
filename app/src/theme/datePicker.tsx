import { css } from 'styled-components'

export const datePickerCSS = css`
  :root {
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

    .react-datepicker__time-container {
      border-left: 1px solid ${({ theme }) => theme.colors.primaryDark};
    }

    .react-datepicker__time-container
      .react-datepicker__time
      .react-datepicker__time-box
      ul.react-datepicker__time-list
      li.react-datepicker__time-list-item {
      background-color: ${({ theme }) => theme.colors.darkerGrey};
      color: ${({ theme }) => theme.colors.creamDark};

      &:hover {
        background-color: ${({ theme }) => theme.colors.primary};
      }
    }

    .react-datepicker__time-container
      .react-datepicker__time
      .react-datepicker__time-box
      ul.react-datepicker__time-list
      li.react-datepicker__time-list-item--selected {
      &,
      &:hover {
        background-color: ${({ theme }) => theme.colors.secondary};
        color: ${({ theme }) => theme.colors.darkerGrey};
      }
    }
  }
`
