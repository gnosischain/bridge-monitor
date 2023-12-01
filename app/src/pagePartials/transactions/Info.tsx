import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: 6px;
  display: flex;
  font-size: 1.3rem;
  font-weight: 300;
  line-height: 1.2;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 1.6rem;
  }
`

const Emphasized = styled.span`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.darkerGrey};
  border-radius: 4px;
  display: flex;
  font-weight: 700;
  height: 23px;
  padding: 0 8px;
`

interface Props {
  date?: string
  transactionsNumber: number
}

export const Info: React.FC<Props> = ({ date, transactionsNumber, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Emphasized>{transactionsNumber}</Emphasized>
      <span>transactions where made on</span>
      <Emphasized>{date}</Emphasized>
    </Wrapper>
  )
}
