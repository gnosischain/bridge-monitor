import { css } from 'styled-components'

export const datePickerCSS = css`
  :root {
    .react-datepicker {
      --datepicker-border-radius: ${({ theme }) => theme.common.borderRadiusBigger};

      background-color: ${({ theme }) => theme.colors.surface};
      border: 1px solid ${({ theme }) => theme.colors.line};
      border-radius: var(--datepicker-border-radius);
      box-shadow: ${({ theme }) => theme.common.shadow};
      font-family: ${({ theme }) => theme.fonts.family};
      font-size: 1.3rem;
      overflow: hidden;
    }

    .react-datepicker__triangle {
      display: none;
    }

    .react-datepicker__month-container {
      background-color: ${({ theme }) => theme.colors.surface};
      padding-bottom: var(--theme-common-space);
    }

    .react-datepicker__header {
      background-color: ${({ theme }) => theme.colors.surface};
      border: none;
      border-bottom: 1px solid ${({ theme }) => theme.colors.line};
      color: ${({ theme }) => theme.colors.ink};
      padding: calc(var(--theme-common-space) * 2) 0 var(--theme-common-space);
    }

    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      border-radius: 50%;
      height: 3rem;
      line-height: 3rem;
      margin: 3px;
      width: 3rem;
    }

    .react-datepicker__navigation {
      top: 12px;
    }

    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      color: ${({ theme }) => theme.colors.ink};
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: var(--theme-common-space);
    }

    .react-datepicker__day-name,
    .react-datepicker__time-name {
      color: ${({ theme }) => theme.colors.fog};
      font-size: 1.2rem;
    }

    .react-datepicker__navigation-icon::before {
      border-color: ${({ theme }) => theme.colors.fog};
    }

    .react-datepicker__day {
      color: ${({ theme }) => theme.colors.ink};

      &.react-datepicker__day--today:not(.react-datepicker__day--selected) {
        color: ${({ theme }) => theme.colors.violet};
        font-weight: 600;
      }

      &.react-datepicker__day--disabled {
        &,
        &:hover {
          background-color: transparent;
          color: ${({ theme }) => theme.colors.faint};
        }
      }
    }

    .react-datepicker__day--outside-month {
      color: ${({ theme }) => theme.colors.fog};
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
      background-color: ${({ theme }) => theme.colors.violet};
      color: ${({ theme }) => theme.colors.surface};
      font-weight: 600;
    }

    .react-datepicker__day:hover,
    .react-datepicker__month-text:hover,
    .react-datepicker__quarter-text:hover,
    .react-datepicker__year-text:hover {
      background-color: ${({ theme }) => theme.colors.lilac};
      border-radius: 50%;
      color: ${({ theme }) => theme.colors.ink};
    }

    .react-datepicker__time-container {
      border-left: 1px solid ${({ theme }) => theme.colors.line};
    }

    .react-datepicker__time-container
      .react-datepicker__time
      .react-datepicker__time-box
      ul.react-datepicker__time-list
      li.react-datepicker__time-list-item {
      background-color: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.ink};

      &:hover {
        background-color: ${({ theme }) => theme.colors.lilac};
      }
    }

    .react-datepicker__time-container
      .react-datepicker__time
      .react-datepicker__time-box
      ul.react-datepicker__time-list
      li.react-datepicker__time-list-item--selected {
      &,
      &:hover {
        background-color: ${({ theme }) => theme.colors.violet};
        color: ${({ theme }) => theme.colors.surface};
      }
    }
  }
`
