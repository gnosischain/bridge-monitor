import styled from 'styled-components'
import { Alert } from '@/src/components/assets/Alert'
import { txTime } from '@/src/utils/txTime'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  padding: calc(var(--theme-common-space) * 3);
`

const Icon = styled(Alert)`
  height: 24px;
  width: 24px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.warning};
  }
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
      <Icon />
      <span>
        Transactions from <Network>{initiatorNetwork}</Network> to{' '}
        <Network>{receiverNetwork}</Network> can take up to{' '}
        <Emphasize>{txTime(initiatorNetwork, receiverNetwork)} minutes</Emphasize>
      </span>
    </Wrapper>
  )
}
