import styled from 'styled-components'

import { MiniCard, MiniCardTitle } from '@/src/components/common/MiniCard'

const Check: React.FC = () => (
  <svg fill="none" height="10" viewBox="0 0 12 10" width="12" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 1.5625L4.125 8.4375L1 5.3125"
      stroke="#F8F5ED"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Minus: React.FC = () => (
  <svg fill="none" height="2" viewBox="0 0 9 2" width="9" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.875 1H1"
      stroke="#F8F5ED"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Wrapper = styled(MiniCard)`
  align-items: center;
`

const Status = styled.div<{ enabled?: boolean }>`
  --size: 32px;

  align-items: center;
  background: ${({ enabled, theme: { colors } }) =>
    enabled ? colors.successDark : colors.darkestGrey};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: var(--size);
  justify-content: center;
  width: var(--size);
`

Status.defaultProps = {
  enabled: false,
}

export const InterestEarning: React.FC<{
  enabled?: boolean
  tooltip?: string
}> = ({ enabled, tooltip, ...restProps }) => (
  <Wrapper {...restProps}>
    <Status enabled={enabled}>
      {enabled && <Check />}
      {!enabled && <Minus />}
    </Status>
    <MiniCardTitle
      title={enabled ? 'Interest earning is enabled' : 'Interest earning is disabled'}
      tooltip={tooltip}
    />
  </Wrapper>
)
