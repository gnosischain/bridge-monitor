import { css } from 'styled-components'

export const datePickerCSS = css`
  :root {
    .react-datepicker {
      --datepicker-border-radius: 8px;

      font-size: 1.2rem;
      background-color: ${({ theme }) => theme.colors.cream};
      border: none;
      border-radius: var(--datepicker-border-radius);
      box-shadow: 0 51px 80px rgba(0, 0, 0, 0.17), 0 19.6444px 25.4815px rgba(0, 0, 0, 0.103259),
        0 4.15556px 6.51852px rgba(0, 0, 0, 0.0667407);
    }

    .react-datepicker__month-container {
      background-color: ${({ theme }) => theme.colors.cream};
      border-radius: var(--datepicker-border-radius);
      border-radius: var(--datepicker-border-radius);
      padding-bottom: var(--theme-common-space);
    }

    .react-datepicker__header {
      background-color: ${({ theme }) => theme.colors.creamDark};
      border-top-left-radius: var(--datepicker-border-radius);
      border-top-right-radius: var(--datepicker-border-radius);
      color: ${({ theme }) => theme.colors.primary};
      border: none;
      padding: calc(var(--theme-common-space) * 2) 0 var(--theme-common-space);
    }

    .react-datepicker-popper[data-placement^='bottom'] .react-datepicker__triangle::before,
    .react-datepicker-popper[data-placement^='bottom'] .react-datepicker__triangle::after {
      border-bottom-color: ${({ theme }) => theme.colors.creamDark};
    }

    .react-datepicker__day-name,
    .react-datepicker__day,
    .react-datepicker__time-name {
      margin: 5px;
    }

    .react-datepicker__navigation {
      top: 10px;
    }

    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header,
    .react-datepicker__day-name,
    .react-datepicker__time-name {
      color: ${({ theme }) => theme.colors.primary};
      font-size: 1.2rem;
    }

    .react-datepicker__navigation-icon::before {
      border-color: ${({ theme }) => theme.colors.primary};
    }

    .react-datepicker__day {
      color: ${({ theme }) => theme.colors.primary};

      &.react-datepicker__day--today:not(.react-datepicker__day--selected) {
        background-color: ${({ theme }) => theme.colors.white};
        color: ${({ theme }) => theme.colors.primary};
        font-weight: 700;
      }

      &.react-datepicker__day--disabled {
        &,
        &:hover {
          background-color: transparent;
          color: ${({ theme }) => theme.colors.primary};
          opacity: 0.5;
        }
      }
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
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.cream};
      font-weight: 700;
    }

    .react-datepicker__day:hover,
    .react-datepicker__month-text:hover,
    .react-datepicker__quarter-text:hover,
    .react-datepicker__year-text:hover {
      background-color: ${({ theme }) => theme.colors.primaryDark};
      color: ${({ theme }) => theme.colors.white};
    }

    .react-datepicker__time-container {
      border-left: 1px solid ${({ theme }) => theme.colors.primaryDark};
    }

    .react-datepicker__time-container
      .react-datepicker__time
      .react-datepicker__time-box
      ul.react-datepicker__time-list
      li.react-datepicker__time-list-item {
      background-color: ${({ theme }) => theme.colors.cream};
      color: ${({ theme }) => theme.colors.primary};

      &:hover {
        background-color: ${({ theme }) => theme.colors.primaryDark};
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
