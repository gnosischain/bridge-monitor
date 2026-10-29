import React, { useMemo } from 'react'
import styled from 'styled-components'

import { ArrowRight } from '@/src/components/assets/ArrowRight'
import { IconLink } from '@/src/components/assets/IconLink'
import { Card } from '@/src/pagePartials/bridgeExplorer/bridges/Card'
import { ContractLimit } from '@/src/pagePartials/bridgeExplorer/bridges/ContractLimit'
import { Fact, Facts } from '@/src/pagePartials/bridgeExplorer/bridges/Fact'
import { TimeLeft } from '@/src/pagePartials/bridgeExplorer/bridges/TimeLeft'
import { TokenAddress } from '@/src/pagePartials/bridgeExplorer/bridges/TokenAddress'
import { ChainsKeys } from '@/src/constants/config/types'
import { formatNumber } from '@/src/utils/format'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { formatUnitsToNumber, percentageNumber } from '@/src/utils/formatNumber'
import { Token } from '@/types/token'
import { TokenIcon } from '@/src/components/token/TokenIcon'

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  justify-content: space-between;
`

const Title = styled.h3`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: var(--theme-common-space);
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;

  .arrowRight {
    color: ${({ theme: { colors } }) => colors.faint};

    .fill {
      fill: currentColor;
    }
  }
`

const TokenPill = styled.a`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: 999px;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: 6px;
  display: flex;
  flex-shrink: 0;
  font-size: 1.4rem;
  font-weight: 600;
  height: 32px;
  line-height: 1;
  padding: 0 12px 0 5px;
  text-decoration: none;

  svg {
    color: ${({ theme: { colors } }) => colors.faint};
  }

  &[href]:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};

    svg {
      color: ${({ theme: { colors } }) => colors.ink};
    }
  }
`

const NotRegistered = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  line-height: 1.5;
  margin: 0;
`

interface Props {
  bridgeReset?: number
  dailyLimit: bigint
  executionDailyLimit: bigint
  executionMaxPerTx: bigint
  from: string
  isNativeToken?: boolean | undefined
  isTokenRegistered?: boolean
  maxPerTx: bigint
  minPerTx: bigint
  networkName: ChainsKeys
  to: string
  token: Token
  tokenTooltip?: string | undefined
  totalExecutedPerDay: bigint
  totalSpentPerDay: bigint
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
  to,
  token,
  tokenTooltip,
  totalExecutedPerDay,
  totalSpentPerDay,
  ...restProps
}) => {
  const { getExplorerUrl } = useWeb3Connection()

  // raw wei arrives from the bridge-limit hooks; format to human units here, at the render
  // boundary, using the token's own decimals (single source of truth stays as bigint upstream)
  const toDisplay = (value: bigint) => formatUnitsToNumber(value, token.decimals)
  const dailyLimitValue = toDisplay(dailyLimit)
  const executionDailyLimitValue = toDisplay(executionDailyLimit)
  const executionMaxPerTxValue = toDisplay(executionMaxPerTx)
  const maxPerTxValue = toDisplay(maxPerTx)
  const minPerTxValue = toDisplay(minPerTx)
  const totalExecutedPerDayValue = toDisplay(totalExecutedPerDay)
  const totalSpentPerDayValue = toDisplay(totalSpentPerDay)

  bridgeReset = useMemo(() => {
    if (bridgeReset) {
      return bridgeReset
    }

    const TODAY_ZERO_UTC = new Date().setUTCHours(0, 0, 0, 0)
    const TOMORROW = new Date(TODAY_ZERO_UTC).getDate() + 1

    return new Date(TODAY_ZERO_UTC).setDate(TOMORROW)
  }, [bridgeReset])

  const symbol = token?.symbol.toUpperCase()
  const tokenIcon = <TokenIcon dimensions={22} iconSource={token?.logoURI} symbol={token?.symbol} />

  return (
    <Card {...restProps}>
      <Header>
        <Title>
          {from}
          <ArrowRight />
          {to}
        </Title>
        {isNativeToken ? (
          <TokenPill as="span">
            {tokenIcon}
            {symbol}
          </TokenPill>
        ) : (
          <TokenPill
            href={getExplorerUrl(token.address, networkName)}
            rel="noopener noreferrer"
            target="_blank"
            title={`View ${symbol} on the explorer`}
          >
            {tokenIcon}
            {symbol}
            <IconLink height={12} width={12} />
          </TokenPill>
        )}
      </Header>
      {isTokenRegistered ? (
        <>
          <ContractLimit
            funds={dailyLimitValue}
            percentage={percentageNumber(totalSpentPerDayValue, dailyLimitValue)}
            title={`${symbol || 'DAI'} deposits per day`}
            tooltip={`Maximum amount of ${symbol} that users can bridge from ${from} to ${to} in a day`}
            used={{ value: totalSpentPerDayValue, title: 'Deposited' }}
          />
          <ContractLimit
            funds={executionDailyLimitValue}
            percentage={percentageNumber(totalExecutedPerDayValue, executionDailyLimitValue)}
            title={`${symbol || 'DAI'} withdrawals per day`}
            tooltip={`Maximum amount of ${symbol} that bridge validators can execute and bridge from ${to} to ${from} in a day`}
            used={{ value: totalExecutedPerDayValue, title: 'Withdrawn' }}
          />
        </>
      ) : (
        <NotRegistered>Token not registered yet.</NotRegistered>
      )}
      <Facts>
        {isTokenRegistered && (
          <>
            <Fact
              label="Min. deposit per transaction"
              tooltip={`Minimum amount of ${symbol} that users can bridge in a single transaction`}
            >
              {formatNumber(minPerTxValue)}
            </Fact>
            <Fact
              label="Max. deposit per transaction"
              tooltip={`Maximum amount of ${symbol} that users can bridge in a single transaction`}
            >
              {formatNumber(maxPerTxValue)}
            </Fact>
            <Fact
              label="Max. withdrawal per transaction"
              tooltip={`Maximum amount of ${symbol} that validators can execute in a single transaction`}
            >
              {formatNumber(executionMaxPerTxValue)}
            </Fact>
            <TimeLeft time={bridgeReset} />
          </>
        )}
        {token && (
          <TokenAddress
            address={token?.address}
            isNative={isNativeToken}
            network={networkName}
            tooltip={tokenTooltip}
          />
        )}
      </Facts>
    </Card>
  )
}
