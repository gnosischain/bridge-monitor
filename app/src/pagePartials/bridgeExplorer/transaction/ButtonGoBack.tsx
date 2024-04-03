import styled from 'styled-components'
import { ButtonPrimary } from '@/src/components/buttons/Button'

const ChevronLeft: React.FC = ({ ...restProps }) => (
  <svg
    fill="none"
    height="18"
    viewBox="0 0 18 18"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      d="M11.6479 14.227C11.7002 14.2792 11.7416 14.3413 11.7699 14.4096C11.7982 14.4779 11.8128 14.551 11.8128 14.6249C11.8128 14.6989 11.7982 14.772 11.7699 14.8403C11.7416 14.9086 11.7002 14.9707 11.6479 15.0229C11.5957 15.0752 11.5336 15.1166 11.4653 15.1449C11.3971 15.1732 11.3239 15.1878 11.25 15.1878C11.176 15.1878 11.1029 15.1732 11.0346 15.1449C10.9663 15.1166 10.9042 15.0752 10.852 15.0229L5.22699 9.39792C5.17469 9.34567 5.1332 9.28364 5.10489 9.21535C5.07658 9.14706 5.06201 9.07387 5.06201 8.99995C5.06201 8.92603 5.07658 8.85283 5.10489 8.78454C5.1332 8.71626 5.17469 8.65422 5.22699 8.60198L10.852 2.97698C10.9575 2.87143 11.1007 2.81213 11.25 2.81213C11.3992 2.81213 11.5424 2.87143 11.6479 2.97698C11.7535 3.08253 11.8128 3.22568 11.8128 3.37495C11.8128 3.52421 11.7535 3.66737 11.6479 3.77292L6.42019 8.99995L11.6479 14.227Z"
      fill="#F0EBDE"
    />
  </svg>
)

export const Wrapper = styled(ButtonPrimary)`
  column-gap: 8px;
  display: none;
  font-size: 1.2rem;
  height: 32px;
  padding: 0 16px;
  position: relative;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    display: flex;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    font-size: 1.4rem;
    height: 40px;
  }
`

export const ButtonGoBack: React.FC<{ onClick: () => void }> = ({ onClick, ...restProps }) => (
  <Wrapper onClick={onClick} {...restProps}>
    <ChevronLeft />
    Go back
  </Wrapper>
)
