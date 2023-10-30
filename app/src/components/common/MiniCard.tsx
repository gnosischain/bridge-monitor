import styled from 'styled-components'

import { Tooltip } from '@/src/components/tooltip/Tooltip'

export const MiniCard = styled.div<{ dark?: boolean }>`
  background: ${({ dark, theme: { colors } }) => (dark ? colors.darkestGrey : colors.darkGrey)};
  border-radius: 8px;
  column-gap: 16px;
  display: flex;
  padding: 16px;
  row-gap: 12px;
`

MiniCard.defaultProps = {
  dark: false,
}

const MiniCardTitleWrapper = styled.div`
  align-items: center;
  column-gap: 4px;
  display: flex;
`

const Title = styled.h4`
  color: ${({ theme: { colors } }) => colors.cream};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

export const MiniCardTitle: React.FC<{ title: string; tooltip?: string }> = ({
  title,
  tooltip,
  ...restProps
}) => {
  return (
    <MiniCardTitleWrapper {...restProps}>
      <Title>{title}</Title>
      {tooltip && <Tooltip content={tooltip} />}
    </MiniCardTitleWrapper>
  )
}

export const MiniCardValue = styled.span`
  color: ${({ theme: { colors } }) => colors.cream};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`
