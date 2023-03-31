import { useState } from 'react'
import styled from 'styled-components'

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
  bridgeReset: number
  chainId: ChainsValues
  contractForeignFunds: number
  contractForeignUsed: number
  contractNativeFunds: number
  contractNativeUsed: number
  executionMaxPerTx: number
  minPerTransaction: number
  maxPerTransaction: number
  defaultToken: Token
  disableTokenDropdown?: boolean
  onTokenChange?: (token: Token) => void
  title: string
  tokenIsRegistered?: boolean
  fromTo: string
  url: string
}

export const BridgeLimit: React.FC<Props> = ({
  bridgeReset,
  chainId,
  contractForeignFunds,
  contractForeignUsed,
  contractNativeFunds,
  contractNativeUsed,
  defaultToken,
  disableTokenDropdown,
  executionMaxPerTx,
  fromTo,
  maxPerTransaction,
  minPerTransaction,
  onTokenChange,
  title,
  tokenIsRegistered = true,
  url,
  ...restProps
}) => {
  const [tokenDropdown, setTokenDropdown] = useState<Token>(defaultToken)
  const refreshTokenDropdown = (token: Token) => {
    setTokenDropdown(token)
    if (typeof onTokenChange !== 'undefined') onTokenChange(token)
  }
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
      {tokenIsRegistered ? (
        <>
          <ContractLimit
            funds={contractNativeFunds}
            percentage={percentageNumber(contractNativeUsed, contractNativeFunds)}
            title="Daily limit"
            token={tokenDropdown?.symbol.toUpperCase() || 'DAI'}
            tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that users can bridge from ${fromTo} in a day`}
            used={contractNativeUsed}
          />
          <ContractLimit
            funds={contractForeignFunds}
            percentage={percentageNumber(contractForeignUsed, contractForeignFunds)}
            title="Execution daily limit"
            token={tokenDropdown?.symbol.toUpperCase() || 'DAI'}
            tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that bridge validators can execute and bridge from ${fromTo} in a day`}
            used={contractForeignUsed}
          />
          <Grid>
            <TransactionLimit
              title="Min. per transaction"
              tooltip={`Minimum amount of ${tokenDropdown?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              trend="down"
              value={minPerTransaction}
            />
            <TransactionLimit
              title="Max. per transaction"
              tooltip={`Maximum amount of ${tokenDropdown?.symbol.toUpperCase()} that users can bridge in a single transaction`}
              trend="up"
              value={maxPerTransaction}
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
