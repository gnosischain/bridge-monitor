import styled from 'styled-components'

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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  row-gap: 4px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: flex-end;
    flex-direction: row;
  }
`

const Text = styled.span<{ bigTitle?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: 6px;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: ${({ bigTitle }) => (bigTitle ? '1.6rem' : '1.3rem')};
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

Text.defaultProps = {
  bigTitle: false,
}

export const MiniCardTitle: React.FC<{
  title: React.ReactNode | string
  subTitle?: React.ReactNode | React.ReactNode
  bigTitle?: boolean
}> = ({ bigTitle, subTitle, title, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Text bigTitle={bigTitle}>{title}</Text>
      {subTitle && <Text>{subTitle}</Text>}
    </Wrapper>
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
