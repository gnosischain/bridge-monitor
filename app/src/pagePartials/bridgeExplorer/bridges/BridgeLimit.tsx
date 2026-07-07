import React, { useMemo } from 'react'
import styled from 'styled-components'
import { formatUnits } from 'viem'

import { IconLink } from '@/src/components/assets/IconLink'
import { InnerCard } from '@/src/components/card/InnerCard'
import { ContractLimit } from '@/src/pagePartials/bridgeExplorer/bridges/ContractLimit'
import { TimeLeft } from '@/src/pagePartials/bridgeExplorer/bridges/TimeLeft'
import { TokenAddress } from '@/src/pagePartials/bridgeExplorer/bridges/TokenAddress'
import { TransactionLimit } from '@/src/pagePartials/bridgeExplorer/bridges/TransactionLimit'
import { ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import { formatNumber } from '@/src/utils/format'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { percentageNumber } from '@/src/utils/formatNumber'
import { Token } from '@/types/token'
import { TokenIcon } from '@/src/components/token/TokenIcon'

const Wrapper = styled(InnerCard)`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  row-gap: calc(var(--theme-common-space) * 2);
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    align-items: center;
    column-gap: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`

const HeaderInner = styled.div`
  align-items: center;
  column-gap: 10px;
  display: flex;
`

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 1.8rem;
    font-weight: 700;
  }
`

const ExternalURL = styled.a`
  --size: 24px;

  align-items: center;
  background: ${({ theme: { colors } }) => colors.cream};
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.primary};
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
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  column-gap: var(--theme-common-space);
  display: flex;
  height: 34px;
  padding: 0 var(--theme-common-space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    margin-left: auto;
  }
`

const TokenSymbol = styled.div`
  color: ${({ theme: { colors } }) => colors.primary};
  flex-shrink: 0;
  font-size: 1.4rem;
  line-height: 1.2;
`

const Grid = styled.div`
  column-gap: calc(var(--theme-common-space) * 2);
  display: grid;
  grid-template-columns: 1fr;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

interface Props {
  bridgeReset?: number
  chainId: ChainsValues
  dailyLimit: bigint
  executionDailyLimit: bigint
  executionMaxPerTx: bigint
  from: string
  isNativeToken?: boolean | undefined
  isTokenRegistered?: boolean
  maxPerTx: bigint
  minPerTx: bigint
  networkName: ChainsKeys
  title: string | React.ReactNode
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
  title,
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
  const toDisplay = (value: bigint) => parseFloat(formatUnits(value, token.decimals))
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

  return (
    <Wrapper {...restProps}>
      <Header>
        <HeaderInner>
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
        </HeaderInner>
        <TokenWrapper>
          <TokenIcon dimensions={18} iconSource={token?.logoURI} symbol={token?.symbol} />
          <TokenSymbol>{token?.symbol.toUpperCase()}</TokenSymbol>
        </TokenWrapper>
      </Header>
      {isTokenRegistered ? (
        <>
          <ContractLimit
            darkBackground
            funds={dailyLimitValue}
            percentage={percentageNumber(totalSpentPerDayValue, dailyLimitValue)}
            title={`${token?.symbol.toUpperCase() || 'DAI'} deposits per day`}
            tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that users can bridge from ${from} to ${to} in a day`}
            used={{ value: totalSpentPerDayValue, title: 'Deposited' }}
          />
          <ContractLimit
            darkBackground
            funds={executionDailyLimitValue}
            percentage={percentageNumber(totalExecutedPerDayValue, executionDailyLimitValue)}
            title={`${token?.symbol.toUpperCase() || 'DAI'} withdrawals per day`}
            tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that bridge validators can execute and bridge from ${to} to ${from} in a day`}
            used={{ value: totalExecutedPerDayValue, title: 'Withdrawn' }}
          />
          <Grid>
            <TransactionLimit
              title="Min. deposit per transaction"
              tooltip={`Minimum amount of ${token?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              value={formatNumber(minPerTxValue)}
            />
            <TransactionLimit
              title="Max. deposit per transaction"
              tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              value={formatNumber(maxPerTxValue)}
            />
          </Grid>
          <TransactionLimit
            title="Max. withdrawal per transaction"
            tooltip={`Maximum amount of ${token?.symbol.toUpperCase()} that validators can execute in a single transaction`}
            value={formatNumber(executionMaxPerTxValue)}
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
