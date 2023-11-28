import { useMemo } from 'react'
import styled from 'styled-components'

import { IconLink } from '@/src/components/assets/IconLink'
import { InnerCard } from '@/src/components/common/InnerCard'
import { ContractLimit } from '@/src/components/limits/ContractLimit'
import { TimeLeft } from '@/src/components/limits/TimeLeft'
import { TokenAddress } from '@/src/components/limits/TokenAddress'
import { TransactionLimit } from '@/src/components/limits/TransactionLimit'
import { ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import { formatNumber } from '@/src/utils/format'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { percentageNumber } from '@/src/utils/formatNumber'
import { Token } from '@/types/token'
import { TokenIcon } from '@/src/components/token/TokenIcon'

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

const TokenWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 6px;
  column-gap: 8px;
  display: flex;
  height: 34px;
  margin-left: auto;
  padding: 0 10px;
`

const TokenSymbol = styled.div`
  color: ${({ theme: { colors } }) => colors.cream};
  flex-shrink: 0;
  font-size: 1.4rem;
  line-height: 1.2;
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
  disableTokenDropdown?: boolean
  executionDailyLimit: number
  executionMaxPerTx: number
  from: string
  isNativeToken?: boolean | undefined
  isTokenRegistered?: boolean
  maxPerTx: number
  minPerTx: number
  networkName: ChainsKeys
  title: string
  to: string
  token: Token
  tokenTooltip?: string | undefined
  totalExecutedPerDay: number
  totalSpentPerDay: number
}

export const BridgeLimit: React.FC<Props> = ({
  bridgeReset,
  dailyLimit,
  executionDailyLimit,
  executionMaxPerTx,
  from,
  isNativeToken,
  isTokenRegistered = true,
  maxPerTx,
  minPerTx,
  networkName,
  title,
  to,
  token,
  tokenTooltip,
  totalExecutedPerDay,
  totalSpentPerDay,
  ...restProps
}) => {
  const { getExplorerUrl } = useWeb3Connection()
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
        {!isNativeToken ? (
          <ExternalURL
            href={getExplorerUrl(token.address, networkName)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <IconLink height={12} width={12} />
          </ExternalURL>
        ) : null}
        <TokenWrapper>
          <TokenIcon dimensions={18} iconSource={token?.logoURI} symbol={token?.symbol} />
          <TokenSymbol>{token?.symbol.toUpperCase()}</TokenSymbol>
        </TokenWrapper>
      </Header>
      {isTokenRegistered ? (
        <>
          <ContractLimit
            funds={dailyLimit}
            percentage={percentageNumber(totalSpentPerDay, dailyLimit)}
            title="Daily Limit"
            token={token?.symbol.toUpperCase() || 'DAI'}
            tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that users can bridge from ${from} to ${to} in a day`}
            used={totalSpentPerDay}
          />
          <ContractLimit
            funds={executionDailyLimit}
            percentage={percentageNumber(totalExecutedPerDay, executionDailyLimit)}
            title="Execution Daily Limit"
            token={token?.symbol.toUpperCase() || 'DAI'}
            tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that bridge validators can execute and bridge from ${to} to ${from} in a day`}
            used={totalExecutedPerDay}
          />
          <Grid>
            <TransactionLimit
              title="Min. per transaction"
              tooltip={`Minimum amount of ${token?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              trend="down"
              value={formatNumber(minPerTx)}
            />
            <TransactionLimit
              title="Max. per transaction"
              tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              trend="up"
              value={formatNumber(maxPerTx)}
            />
          </Grid>
          <TransactionLimit
            title="Execution max. per transaction"
            tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that validators can execute in a single transaction`}
            trend="up"
            value={formatNumber(executionMaxPerTx)}
          />
          <TimeLeft time={bridgeReset} />
        </>
      ) : (
        <p>Token not registered yet.</p>
      )}
      {token && (
        <TokenAddress
          address={token?.address}
          isNative={isNativeToken}
          network={networkName}
          tooltip={tokenTooltip}
        />
      )}
    </Wrapper>
  )
}
