import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  column-gap: 5px;
  display: flex;
  flex-wrap: wrap;
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.4;
`

const Emphasized = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
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
