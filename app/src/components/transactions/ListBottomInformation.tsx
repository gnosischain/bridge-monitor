import styled from 'styled-components'

const BottomInformation = styled.div`
  background-color: ${({ theme }) => theme.colors.darkerGrey};
  margin: ${({ theme: { common } }) => common.space * 6}px 0 0;
  padding: ${({ theme: { common } }) => common.space * 2}px;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
`

const Results = styled.p`
  text-align: center;
  font-size: 1.4rem;
  font-weight: 300;
  strong {
    background-color: ${({ theme }) => theme.colors.darkestGrey};
    font-weight: 400;
    display: inline-block;
    border-radius: ${({ theme: { common } }) => common.borderRadius};
    padding: ${({ theme: { common } }) => common.space / 4}px
      ${({ theme: { common } }) => common.space}px;
    margin: 0 5px;
  }
`

interface Props {
  transactionsNumber: number
  startDate: string
  endDate: string
}

export const ListBottomInformation: React.FC<Props> = ({
  endDate,
  startDate,
  transactionsNumber,
}) => {
  return (
    <BottomInformation>
      <Results>
        <strong>{transactionsNumber}</strong> transactions where made from{' '}
        <strong>{startDate}</strong> to <strong>{endDate}</strong>
      </Results>
    </BottomInformation>
  )
}
