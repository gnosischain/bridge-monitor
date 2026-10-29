import styled from 'styled-components'

import { Tooltip } from '@/src/components/tooltip'

export const Facts = styled.dl`
  display: flex;
  flex-direction: column;
  margin: 0;
`

const Row = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  display: flex;
  flex-wrap: wrap;
  gap: 4px calc(var(--theme-common-space) * 2);
  justify-content: space-between;
  padding: calc(var(--theme-common-space) * 1.5) 0;

  &:last-child {
    padding-bottom: 0;
  }
`

const Label = styled.dt`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  column-gap: 6px;
  display: flex;
  font-size: 1.4rem;
  line-height: 1.4;
`

// Pushed right, also when it wraps under a long label on a phone.
const Value = styled.dd`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 0 auto;
`

interface Props {
  children: React.ReactNode
  label: React.ReactNode
  tooltip?: string
}

export const Fact: React.FC<Props> = ({ children, label, tooltip, ...restProps }) => (
  <Row {...restProps}>
    <Label>
      {label}
      {tooltip && <Tooltip content={tooltip} />}
    </Label>
    <Value>{children}</Value>
  </Row>
)
