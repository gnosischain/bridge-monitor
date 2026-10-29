import styled from 'styled-components'
import { Alert } from '@/src/components/assets/Alert'
import { txTime } from '@/src/utils/txTime'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.warningSoft};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.45;
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);
`

const Icon = styled(Alert)`
  flex-shrink: 0;
  height: 20px;
  width: 20px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.warning};
  }
`

const Network = styled.span`
  text-transform: capitalize;
`

const Emphasize = styled.span`
  font-weight: 600;
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
        <Network>{receiverNetwork}</Network> usually take ~
        <Emphasize>{txTime(initiatorNetwork)}</Emphasize>
      </span>
    </Wrapper>
  )
}
