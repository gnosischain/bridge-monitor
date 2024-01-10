import styled from 'styled-components'

export const MiniCard = styled.div<{ darkBackground?: boolean }>`
  background-color: ${({ darkBackground, theme: { colors } }) =>
    darkBackground ? colors.cream : colors.white};
  border-radius: 8px;
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 2 - var(--theme-common-space) / 2);
`

const MiniCardHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  row-gap: 4px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: flex-end;
    flex-direction: row;
  }
`

const Title = styled.span<{ bigTitle?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: ${({ bigTitle }) => (bigTitle ? '1.6rem' : '1.4rem')};
  font-weight: 400;
  line-height: 1.2;
`

const SubTitle = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: var(--theme-common-space);
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

Title.defaultProps = {
  bigTitle: false,
}

export const MiniCardHeader: React.FC<{
  title: React.ReactNode | string
  subTitle?: React.ReactNode | React.ReactNode
  bigTitle?: boolean
}> = ({ bigTitle, subTitle, title, ...restProps }) => {
  return (
    <MiniCardHeaderWrapper {...restProps}>
      <Title bigTitle={bigTitle}>{title}</Title>
      {subTitle && <SubTitle>{subTitle}</SubTitle>}
    </MiniCardHeaderWrapper>
  )
}

export const MiniCardValue = styled.span`
  color: ${({ theme: { colors } }) => colors.primary};
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`
