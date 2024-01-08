import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
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
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 4px;
  color: ${({ theme: { colors } }) => colors.primary};
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
      <span>transactions were made on</span>
      <Emphasized>{date}</Emphasized>
    </Wrapper>
  )
}
