import { useEffect, useReducer } from 'react'
import styled from 'styled-components'
import { AmountTokenInput } from '@/src/pagePartials/bridge/bridgeForm/AmountTokenInput'
import { ButtonPlaceholder } from '@/src/pagePartials/bridge/bridgeForm/button/ButtonPlaceholder'
import { RecipientAddress } from '@/src/pagePartials/bridge/bridgeForm/RecipientAddress'
import { CardPlaceholder } from '@/src/pagePartials/bridge/bridgeForm/CardPlaceholder'
import { Chains } from '@/src/constants/config/types'
import { Header } from '@/src/pagePartials/bridge/bridgeForm/Header'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'
import { InnerCard } from '@/src/pagePartials/bridge/bridgeForm/InnerCard'
import { UnwrapFirst } from '@/src/pagePartials/bridge/bridgeForm/warnings/UnwrapFirst'
import { Switch } from '@/src/pagePartials/bridge/bridgeForm/Switch'
import { Wrapper } from '@/src/pagePartials/bridge/common/Wrapper'
import { Token } from '@/types/token'
import { TokenDropdown } from '@/src/pagePartials/bridge/bridgeForm/TokenDropdown'
import {
  AURA_ETHEREUM,
  AURA_GNOSIS,
  AURA_GNOSIS_CANONICAL,
  EURe_ETHEREUM,
  EURe_GNOSIS,
  USDC_ETHEREUM,
  USDCe_GNOSIS,
  WXDAI_GNOSIS,
  sDAI_GNOSIS,
} from '@/src/constants/misc'
import { chainsConfig } from '@/src/constants/config/chains'
import SafeSuspense from '@/src/components/safeSuspense'
import { getToChainId, isSameString } from '@/src/utils/tools'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useDebounce } from 'use-debounce'
import TokenListProvider, { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { BridgeFormState } from '@/src/pagePartials/bridge/bridgeForm/types'
import { NATIVE_TOKEN_ADDRESS } from '@/src/constants/config/common'
import { Chain } from '@/src/pagePartials/bridge/bridgeForm/Chain'
import { UserBalance } from '@/src/pagePartials/bridge/bridgeForm/UserBalance'
import { BridgeSummary } from '@/src/pagePartials/bridge/bridgeForm/BridgeSummary'
import { ReceivedTokenInfo } from '@/src/pagePartials/bridge/bridgeForm/ReceivedTokenInfo'
import { useBridgeTokenOutInfo } from '@/src/hooks/bridge/useBridgeTokenOutInfo'
import { NotBridgedERC20Warning } from './warnings/NotBridgedERC20Warning'
import { ExternalBridgeWarning } from './warnings/ExternalBridgeWarning'
import {
  UsdcEGcWarning,
  UsdcEthWarning,
} from '@/src/pagePartials/bridge/bridgeForm/warnings/UsdcWarnings'
import { UnifiedBridgeButton } from './button/UnifiedBridgeButton'
import { useRouter } from 'next/router'
import { useSanitizedQuery } from '@/src/hooks/useSanitizedQuery'
import { isBlockedToken } from '@/src/utils/blockedTokens'
import { getChainKey } from '@/src/constants/config/chains'
import { ShowTokenAddress } from './ShowTokenAddress'
import { parseUnits, zeroAddress } from 'viem'

const PanelLabel = styled.h3`
  ${EyebrowCSS}
  margin: 0;
`

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2.5);
  width: 100%;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
`

const FormCards = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--theme-common-space);
  width: 100%;
`

const InnerCardFrom = styled(InnerCard)`
  position: relative;
`

const PanelHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 20px;
`

const AmountRow = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  min-height: 44px;
`

const PanelFooter = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  min-height: 20px;
  row-gap: 4px;
`

const SkeletonCommon: React.FC = () => (
  <Wrapper>
    <FormWrapper>
      <Header />
      <Form as="div">
        <FormCards>
          <CardPlaceholder />
          <CardPlaceholder />
        </FormCards>
        <ButtonPlaceholder />
      </Form>
    </FormWrapper>
  </Wrapper>
)

const initialState: BridgeFormState = {
  account: '',
  amount: '',
  fromChainId: Chains.mainnet,
  receiveNativeToken: false,
  recipient: '',
  toChainId: Chains.gnosis,
  token: undefined,
  receiveUsds: false,
}

const Main = () => {
  const router = useRouter()
  const { address, getExplorerUrl, walletChainId } = useWeb3Connection()
  const { tokensByNetwork } = useBridgedTokens()

  const sanitizedQuery = useSanitizedQuery(tokensByNetwork)

  const [formState, dispatch] = useReducer(
    (data: BridgeFormState, partial: Partial<BridgeFormState>): BridgeFormState => ({
      ...data,
      ...partial,
    }),
    {
      ...initialState,
      account: address || zeroAddress,
      ...sanitizedQuery,
    },
  )

  useEffect(() => {
    const currentQuery = {
      fromChainId: formState.fromChainId.toString(),
      token: formState.token?.address || '',
      amount: formState.amount,
    }

    const hasQueryChanged = Object.entries(currentQuery).some(
      ([key, value]) => router.query[key] !== value,
    )

    if (hasQueryChanged) {
      router.replace({ pathname: router.pathname, query: currentQuery }, undefined, {
        shallow: true,
      })
    }
  }, [formState.amount, formState.fromChainId, formState.token?.address, router])

  const [debouncedAmount] = useDebounce(formState.amount, 500)

  const amount = parseUnits(debouncedAmount || '0', formState.token?.decimals || 0)

  const handleFromChainIdChange = async () => {
    const newFromChainId = formState.toChainId === 100 ? 100 : 1

    let otherSideToken =
      formState.token?.extensions.bridgeInfo[formState.toChainId]?.tokenAddress || ''

    if (
      formState.fromChainId === Chains.mainnet &&
      isSameString(formState.token?.address, chainsConfig[Chains.mainnet].bridge.DAI)
    ) {
      otherSideToken = NATIVE_TOKEN_ADDRESS
    }

    if (isSameString(formState.token?.address, USDCe_GNOSIS)) {
      otherSideToken = USDC_ETHEREUM
    }

    const token = tokensByNetwork[formState.toChainId].find((token) =>
      isSameString(token.address, otherSideToken),
    )

    dispatch({
      ...initialState,
      account: address || zeroAddress,
      fromChainId: newFromChainId,
      toChainId: getToChainId(newFromChainId),
      token,
    })
  }

  const unwrapFirst =
    formState.fromChainId == Chains.gnosis &&
    (isSameString(formState.token?.address || '', WXDAI_GNOSIS) ||
      isSameString(formState.token?.address || '', sDAI_GNOSIS))

  const sendToExternalBridge =
    isSameString(formState.token?.address || '', EURe_GNOSIS) ||
    isSameString(formState.token?.address || '', EURe_ETHEREUM) ||
    isSameString(formState.token?.address || '', AURA_GNOSIS) ||
    isSameString(formState.token?.address || '', AURA_ETHEREUM) ||
    isSameString(formState.token?.address || '', AURA_GNOSIS_CANONICAL)

  const isUsdcEth = isSameString(formState.token?.address || '', USDC_ETHEREUM)
  const isUsdceGC = isSameString(formState.token?.address || '', USDCe_GNOSIS)

  const tokenOut = useBridgeTokenOutInfo({
    fromChainId: formState.fromChainId,
    receiveNativeToken: formState.receiveNativeToken,
    receiveUsds: formState.receiveUsds,
    toChainId: formState.toChainId,
    token: formState.token,
  })

  const isNotBridgedErc20 =
    (tokenOut?.chainId === 1 && tokenOut.extensions.bridgeInfo[1]?.tokenAddress === zeroAddress) ||
    isBlockedToken(formState.token?.address || '')
      ? true
      : false

  return (
    <Wrapper>
      <FormWrapper>
        <Header />
        <Form>
          <FormCards>
            <InnerCardFrom>
              <PanelHeader>
                <PanelLabel>From</PanelLabel>
                <Chain chainId={formState.fromChainId} />
              </PanelHeader>
              <AmountRow>
                <AmountTokenInput
                  decimals={formState.token?.decimals || 18}
                  disabled={isNotBridgedErc20}
                  onChange={(value) => dispatch({ ...formState, amount: value })}
                  placeholder="0.00"
                  value={formState.amount}
                />
                <TokenDropdown
                  defaultToken={formState.token}
                  fromChainId={formState.fromChainId}
                  key={'tokenIn'}
                  onChange={(token: Token) => {
                    dispatch({ ...formState, token, receiveNativeToken: false, amount: '' })
                  }}
                  toChainId={formState.toChainId}
                />
              </AmountRow>
              <PanelFooter>
                <UserBalance
                  $address={address}
                  $fromChainId={formState.fromChainId}
                  $onMax={(value) => dispatch({ ...formState, amount: value })}
                  $toChainId={formState.toChainId}
                  $token={formState.token}
                />
                <ShowTokenAddress
                  address={formState.token?.address || ''}
                  explorerUrl={getExplorerUrl(
                    formState.token?.address || '',
                    getChainKey(formState.fromChainId),
                  )}
                />
              </PanelFooter>

              <Switch onClick={() => handleFromChainIdChange()} />
            </InnerCardFrom>
            <InnerCard>
              <PanelHeader>
                <PanelLabel>To</PanelLabel>
                <Chain chainId={formState.toChainId} />
              </PanelHeader>
              {isUsdcEth && <UsdcEthWarning />}
              {isUsdceGC && <UsdcEGcWarning />}
              {unwrapFirst && <UnwrapFirst symbol={formState.token?.symbol} />}
              {sendToExternalBridge && formState.token && (
                <ExternalBridgeWarning token={formState.token} />
              )}
              {isNotBridgedErc20 && !unwrapFirst && !sendToExternalBridge && (
                <NotBridgedERC20Warning />
              )}

              {!unwrapFirst && !sendToExternalBridge && !isNotBridgedErc20 && (
                <>
                  <AmountRow>
                    <ReceivedTokenInfo
                      amount={amount}
                      fromChainId={formState.fromChainId}
                      setReceiveNativeToken={(receiveNative: boolean) => {
                        dispatch({ ...formState, receiveNativeToken: receiveNative })
                      }}
                      setReceiveUsds={(receiveUsds: boolean) => {
                        dispatch({ ...formState, receiveUsds: receiveUsds })
                      }}
                      toChainId={formState.toChainId}
                      token={formState.token}
                      tokenOut={tokenOut}
                    />
                  </AmountRow>
                  <PanelFooter>
                    <UserBalance
                      $address={address}
                      /* Inverted values as we need to get the values from the other side of the chain */
                      $fromChainId={formState.toChainId}
                      $toChainId={formState.fromChainId}
                      $token={tokenOut}
                    />
                    <ShowTokenAddress
                      address={tokenOut?.address || ''}
                      explorerUrl={getExplorerUrl(
                        tokenOut?.address || '',
                        getChainKey(formState.toChainId),
                      )}
                    />
                  </PanelFooter>
                  <RecipientAddress
                    onChange={(event) => dispatch({ ...formState, recipient: event.target.value })}
                    recipient={formState.recipient}
                  />
                </>
              )}
            </InnerCard>
          </FormCards>
          {amount > 0n &&
            formState.token &&
            tokenOut &&
            address &&
            walletChainId == formState.fromChainId && (
              <BridgeSummary
                amount={amount}
                fromChainId={formState.fromChainId}
                receiveNativeToken={formState.receiveNativeToken}
                recipient={formState.recipient}
                toChainId={formState.toChainId}
                token={formState.token}
                tokenOut={tokenOut}
                userAddress={address}
              />
            )}
          <UnifiedBridgeButton
            amount={amount}
            fromChainId={formState.fromChainId}
            fromToken={formState.token}
            isUsdceGC={isUsdceGC}
            receiveNativeToken={formState.receiveNativeToken}
            recipient={formState.recipient}
            sendToExternalBridge={sendToExternalBridge}
            toChainId={formState.toChainId}
            toToken={tokenOut}
            userAddress={address}
          />
        </Form>
      </FormWrapper>
    </Wrapper>
  )
}

export const BridgeFormIndex: React.FC = () => (
  <SafeSuspense fallback={<SkeletonCommon />}>
    <TokenListProvider>
      <Main />
    </TokenListProvider>
  </SafeSuspense>
)
