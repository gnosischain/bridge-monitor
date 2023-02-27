import { useState } from 'react'
import styled from 'styled-components'

import { BridgeLimit } from '@/src/components/limits/BridgeLimit'
import { TabContentInner } from '@/src/components/tabs/TabContentInner'
import { BaseSubTitle } from '@/src/components/text/BaseSubTitle'
import { Chains, chainsConfig } from '@/src/constants/config/chains'
import { contracts } from '@/src/constants/config/contracts'
import { Token, tokens } from '@/src/constants/token'
import {
  useForeignOMNIBridgeLimits,
  useHomeOMNIBridgeLimits,
} from '@/src/hooks/contracts/useOMNIContractCalls'
import {
  useForeignXDAIBridgeLimits,
  useHomeXDAIBridgeLimits,
} from '@/src/hooks/contracts/useXDAIContractCalls'
import { useTokenIcons } from '@/src/providers/tokenIconsProvider'

const Wrapper = styled(TabContentInner)``

const Columns = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`
const MAINNET = 'mainnet'

const getContractAddressUrl = (network: string, address: string) => {
  const chain = network === MAINNET ? Chains.mainnet : Chains.gnosis
  return `${chainsConfig[chain].blockExplorerUrls[0]}address/${address}`
}

export const DailyBridgeLimits: React.FC = ({ ...restProps }) => {
  const { gnosisTokensBySymbol, tokensBySymbol } = useTokenIcons()
  const { foreignXDAIinformation } = useForeignXDAIBridgeLimits()
  const { homeXDAIinformation } = useHomeXDAIBridgeLimits()
  const defaultMainnetToken = tokensBySymbol['gno']
  const [mainnetToken, setMainnetToken] = useState<Token>(defaultMainnetToken)
  const { foreignOMNIinformation } = useForeignOMNIBridgeLimits(mainnetToken)
  const defaultGnosisToken = gnosisTokensBySymbol['gno']
  const [gnosisToken, setGnosisToken] = useState<Token>(defaultGnosisToken)
  const { homeOMNIinformation } = useHomeOMNIBridgeLimits(gnosisToken)

  const onChangeForeignToken = (token: Token) => {
    if (token) setMainnetToken(token)
  }
  const onChangeHomeToken = (token: Token) => {
    if (token) setGnosisToken(token)
  }

  return (
    <Wrapper {...restProps}>
      <div>
        <BaseSubTitle>xDai</BaseSubTitle>
        <Columns>
          <BridgeLimit
            bridgeReset={1667054970000}
            chainId={Chains.mainnet}
            contractForeignFunds={foreignXDAIinformation.dailyLimit}
            contractForeignUsed={foreignXDAIinformation.totalSpentPerDay}
            contractNativeFunds={foreignXDAIinformation.executionDailyLimit}
            contractNativeUsed={foreignXDAIinformation.totalExecutedPerDay}
            defaultToken={tokensBySymbol['dai']}
            disableTokenDropdown
            executionMaxPerTx={foreignXDAIinformation.executionMaxPerTx}
            fromTo={'Gnosis to Ethereum'}
            maxPerTransaction={foreignXDAIinformation.maxPerTx}
            minPerTransaction={foreignXDAIinformation.minPerTx}
            title="ETH -> GC"
            url={getContractAddressUrl('mainnet', contracts['XDAI']['address'][Chains.mainnet])}
          />
          <BridgeLimit
            bridgeReset={1666442910000}
            chainId={Chains.gnosis}
            contractForeignFunds={homeXDAIinformation.dailyLimit}
            contractForeignUsed={homeXDAIinformation.totalSpentPerDay}
            contractNativeFunds={homeXDAIinformation.executionDailyLimit}
            contractNativeUsed={homeXDAIinformation.totalExecutedPerDay}
            defaultToken={tokens['XDAI']}
            disableTokenDropdown
            executionMaxPerTx={homeXDAIinformation.executionMaxPerTx}
            fromTo={'Ethereum to Gnosis'}
            maxPerTransaction={homeXDAIinformation.maxPerTx}
            minPerTransaction={homeXDAIinformation.minPerTx}
            title="GC -> ETH"
            url={getContractAddressUrl('gnosis', contracts['XDAI']['address'][Chains.gnosis])}
          />
        </Columns>
      </div>
      <div>
        <BaseSubTitle>Omnibridge</BaseSubTitle>
        <Columns>
          <BridgeLimit
            bridgeReset={1666882170000}
            chainId={Chains.mainnet}
            contractForeignFunds={foreignOMNIinformation.dailyLimit}
            contractForeignUsed={foreignOMNIinformation.totalSpentPerDay}
            contractNativeFunds={foreignOMNIinformation.executionDailyLimit}
            contractNativeUsed={foreignOMNIinformation.totalExecutedPerDay}
            defaultToken={defaultMainnetToken}
            executionMaxPerTx={foreignOMNIinformation.executionMaxPerTx}
            fromTo={'Gnosis to Ethereum'}
            maxPerTransaction={foreignOMNIinformation.maxPerTx}
            minPerTransaction={foreignOMNIinformation.minPerTx}
            onTokenChange={onChangeForeignToken}
            title="ETH -> GC"
            tokenIsRegistered={foreignOMNIinformation.isTokenRegistered}
            url={getContractAddressUrl('mainnet', contracts['OMNI']['address'][Chains.mainnet])}
          />
          <BridgeLimit
            bridgeReset={1666450170000}
            chainId={Chains.gnosis}
            contractForeignFunds={homeOMNIinformation.dailyLimit}
            contractForeignUsed={homeOMNIinformation.totalSpentPerDay}
            contractNativeFunds={homeOMNIinformation.executionDailyLimit}
            contractNativeUsed={homeOMNIinformation.totalExecutedPerDay}
            defaultToken={defaultGnosisToken}
            executionMaxPerTx={homeOMNIinformation.executionMaxPerTx}
            fromTo={'Gnosis to Ethereum'}
            maxPerTransaction={homeOMNIinformation.maxPerTx}
            minPerTransaction={homeOMNIinformation.minPerTx}
            onTokenChange={onChangeHomeToken}
            title="GC -> ETH"
            tokenIsRegistered={homeOMNIinformation.isTokenRegistered}
            url={getContractAddressUrl('gnosis', contracts['OMNI']['address'][Chains.gnosis])}
          />
        </Columns>
      </div>
    </Wrapper>
  )
}
