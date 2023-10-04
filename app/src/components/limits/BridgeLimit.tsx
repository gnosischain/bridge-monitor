import { IconLink } from '@/src/components/assets/IconLink'
import { InnerCard } from '@/src/components/common/InnerCard'
import { ContractLimit } from '@/src/components/limits/ContractLimit'
import { TimeLeft } from '@/src/components/limits/TimeLeft'
import { TokenAddress } from '@/src/components/limits/TokenAddress'
import { TransactionLimit } from '@/src/components/limits/TransactionLimit'
import { TokenDropdown as BaseDropdown } from '@/src/components/token/TokenDropdown'
import { ChainsValues } from '@/src/constants/config/types'
import { percentageNumber } from '@/src/utils/formatNumber'
import { Token } from '@/types/token'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled(InnerCard)``

const Header = styled.div`
  align-items: center;
  column-gap: 10px;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme: { common } }) => common.space}px;
`

const Title = styled.h3`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  margin: 0;
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.2;
`

const ExternalURL = styled.a`
  --size: 24px;

  align-items: center;
  background: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  height: var(--size);
  justify-content: center;
  text-decoration: none;
  width: var(--size);

  &:active {
    opacity: 0.5;
  }
`

const TokenDropdown = styled(BaseDropdown)`
  margin-left: auto;
`

const Grid = styled.div`
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

interface Props {
  bridgeReset?: number
  chainId: ChainsValues
  dailyLimit: number
  defaultToken: Token
  disableTokenDropdown?: boolean
  executionDailyLimit: number
  executionMaxPerTx: number
  from: string
  isTokenRegistered?: boolean
  maxPerTx: number
  minPerTx: number
  onTokenChange?: (token: Token) => void
  title: string
  to: string
  totalExecutedPerDay: number
  totalSpentPerDay: number
  url: string
}

export const BridgeLimit: React.FC<Props> = ({
  bridgeReset,
  chainId,
  dailyLimit,
  defaultToken,
  disableTokenDropdown,
  executionDailyLimit,
  executionMaxPerTx,
  from,
  isTokenRegistered = true,
  maxPerTx,
  minPerTx,
  onTokenChange,
  title,
  to,
  totalExecutedPerDay,
  totalSpentPerDay,
  url,
  ...restProps
}) => {
  const [tokenDropdown, setTokenDropdown] = useState<Token>(defaultToken)
  const refreshTokenDropdown = (token: Token) => {
    setTokenDropdown(token)

    if (typeof onTokenChange !== 'undefined') {
      onTokenChange(token)
    }
  }

  bridgeReset = useMemo(() => {
    if (bridgeReset) {
      return bridgeReset
    }

    const TODAY_ZERO_UTC = new Date().setUTCHours(0, 0, 0, 0)
    const TOMORROW = new Date(TODAY_ZERO_UTC).getDate() + 1

    return new Date(TODAY_ZERO_UTC).setDate(TOMORROW)
  }, [bridgeReset])

  return (
    <Wrapper {...restProps}>
      <Header>
        <Title>{title}</Title>
        <ExternalURL href={url} rel="noopener noreferrer" target="_blank">
          <IconLink height={12} width={12} />
        </ExternalURL>
        <TokenDropdown
          chainId={chainId}
          defaultToken={defaultToken}
          disabled={disableTokenDropdown}
          onChange={refreshTokenDropdown}
        />
      </Header>
      {isTokenRegistered ? (
        <>
          <ContractLimit
            funds={dailyLimit}
            percentage={percentageNumber(totalSpentPerDay, dailyLimit)}
            title="Daily Limit"
            token={tokenDropdown?.symbol.toUpperCase() || 'DAI'}
            tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that users can bridge from ${from} to ${to} in a day`}
            used={totalSpentPerDay}
          />
          <ContractLimit
            funds={executionDailyLimit}
            percentage={percentageNumber(totalExecutedPerDay, executionDailyLimit)}
            title="Execution Daily Limit"
            token={tokenDropdown?.symbol.toUpperCase() || 'DAI'}
            tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that bridge validators can execute and bridge from ${to} to ${from} in a day`}
            used={totalExecutedPerDay}
          />
          <Grid>
            <TransactionLimit
              title="Min. per transaction"
              tooltip={`Minimum amount of ${tokenDropdown?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              trend="down"
              value={minPerTx}
            />
            <TransactionLimit
              title="Max. per transaction"
              tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              trend="up"
              value={maxPerTx}
            />
          </Grid>
          <TransactionLimit
            title="Execution max. per transaction"
            tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that validators can execute in a single transaction`}
            trend="up"
            value={executionMaxPerTx}
          />
          <TimeLeft time={bridgeReset} />
        </>
      ) : (
        <p>Token not registered yet.</p>
      )}
      {tokenDropdown && <TokenAddress address={tokenDropdown?.address} />}
    </Wrapper>
  )
}
