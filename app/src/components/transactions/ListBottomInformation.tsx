import styled from 'styled-components'

import { GnosisChainLogo } from '@/src/components/common/Logo'

const Results = styled.p`
  text-align: center;
  font-size: 1.4rem;
  font-weight: 300;
  strong {
    font-weight: 700;
  }
`
const BottomInformation = styled.div`
  background-color: ${({ theme }) => theme.colors.darkerGrey};
  margin: ${({ theme: { common } }) => common.space * 6}px 0
    ${({ theme: { common } }) => common.space * 2}px;
  padding: ${({ theme: { common } }) => common.space * 2}px;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    flex-direction: column;
  }
  div {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    opacity: 0.6;
    gap: ${({ theme: { common } }) => common.space}px;
    svg {
      max-width: 90px;
    }
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
      <div>
        Powered by <GnosisChainLogo />
      </div>
    </BottomInformation>
  )
}
