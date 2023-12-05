import styled from 'styled-components'
import { Warning } from '@/src/components/assets/Warning'

const Wrapper = styled.div`
  background: rgba(22, 29, 26, 0.5);
  border-radius: 8px;
  border: 1px solid var(--Darkest-grey, #161d1a);
  box-shadow: 0 2.2px 6.519px 0 rgba(0, 0, 0, 0.03), 0 10.4px 25.481px 0 rgba(0, 0, 0, 0.04),
    0 27px 80px 0 rgba(0, 0, 0, 0.07);
  color: ${({ theme: { colors } }) => colors.cream};
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  margin-top: ${({ theme: { common } }) => common.space * 2}px;
  padding: ${({ theme: { common } }) => common.space * 2}px
    ${({ theme: { common } }) => common.space * 3}px;
`

const Network = styled.span`
  text-transform: capitalize;
`

const Emphasize = styled.span`
  font-weight: 700;
`

export const DelayWarning: React.FC<{ initiatorNetwork: string; receiverNetwork: string }> = ({
  initiatorNetwork,
  receiverNetwork,
  ...restProps
}) => {
  const mainnetToGnosis =
    initiatorNetwork.toLowerCase() === 'mainnet' && receiverNetwork.toLowerCase() === 'gnosis'
  const delay = mainnetToGnosis ? '20' : '10'

  return (
    <Wrapper {...restProps}>
      <Warning />
      <span>
        Transactions from <Network>{initiatorNetwork}</Network> to{' '}
        <Network>{receiverNetwork}</Network> can take up to <Emphasize>{delay} minutes</Emphasize>
      </span>
    </Wrapper>
  )
}
