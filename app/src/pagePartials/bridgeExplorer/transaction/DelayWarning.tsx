import styled from 'styled-components'
import { Warning } from '@/src/components/assets/Warning'
import { txTime } from '@/src/utils/txTime'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamDark};
  border-radius: 8px;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 1.2;
  margin-top: calc(var(--theme-common-space) * 2);
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
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
  return (
    <Wrapper {...restProps}>
      <Warning />
      <span>
        Transactions from <Network>{initiatorNetwork}</Network> to{' '}
        <Network>{receiverNetwork}</Network> can take up to{' '}
        <Emphasize>{txTime(initiatorNetwork, receiverNetwork)} minutes</Emphasize>
      </span>
    </Wrapper>
  )
}
