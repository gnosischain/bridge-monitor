import { useReducer } from 'react'
import styled from 'styled-components'
import { AmountTokenInput } from '@/src/pagePartials/bridge/bridgeForm/AmountTokenInput'
import {
  BridgeButton,
  ButtonPlaceholder,
  DisabledBridgeButton,
} from '@/src/pagePartials/bridge/bridgeForm/BridgeButton'
import { RecipientAddress } from '@/src/pagePartials/bridge/bridgeForm/RecipientAddress'
import { CardPlaceholder } from '@/src/pagePartials/bridge/bridgeForm/CardPlaceholder'
import { Chains } from '@/src/constants/config/types'
import { Header } from '@/src/pagePartials/bridge/bridgeForm/Header'
import { InnerCard } from '@/src/pagePartials/bridge/bridgeForm/InnerCard'
import { ButtonUnwrapFirst, UnwrapFirst } from '@/src/pagePartials/bridge/bridgeForm/UnwrapFirst'
import { Switch } from '@/src/pagePartials/bridge/bridgeForm/Switch'
import { Wrapper } from '@/src/pagePartials/bridge/common/Wrapper'
import { Token } from '@/types/token'
import { TokenDropdown } from '@/src/pagePartials/bridge/bridgeForm/TokenDropdown'
import {
  AURA_ETHEREUM,
  AURA_GNOSIS,
  EURe_ETHEREUM,
  EURe_GNOSIS,
  USDC_ETHEREUM,
  USDCe_GNOSIS,
  WXDAI_GNOSIS,
  ZERO_ADDRESS,
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
import { toBN } from '@/src/utils/bigNumber'
import { NotBridgedERC20Warning } from './NotBridgedERC20Warning'
import { ExternalBridgeWarning } from './ExternalBridgeWarning'
import { UsdcEGcWarning, UsdcEthWarning } from './UsdcWarnings'

const Title = styled.h2`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  justify-content: space-between;
  line-height: 1.2;
  margin: 0;
  width: 100%;
`

export const FormWrapper = styled.div<{ hidden?: boolean }>`
  display: ${({ hidden }) => (hidden ? 'none' : 'flex')};
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
  max-width: 644px;
  row-gap: calc(var(--theme-common-space) * 3);
  width: 100%;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 3);
  width: 100%;
`

const FormCards = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--theme-common-space);
  width: 100%;
`

const InnerCardFrom = styled(InnerCard)`
  padding-bottom: calc(var(--theme-common-space) * 5);
  position: relative;
`

const OnChainInfo = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: calc(var(--theme-common-space) * -1);
  width: 100%;
`

const BridgedToken = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  column-gap: var(--theme-common-space);
  display: flex;
  height: 54px;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2);
`

const FromTokenDropdown = styled(TokenDropdown)`
  height: 100%;
  margin-left: calc(var(--theme-common-space) * -1);

  .dropdownButton {
    height: 100%;
  }
`

const AmountInput = styled(AmountTokenInput)`
  margin-right: calc(var(--theme-common-space) * -1);
`

// const sanitizeAmount = (amount: string, decimals: number) => {
//   if (!amount.includes('.')) return amount

//   const parts = amount.split('.')
//   const decimalPart = parts[1].slice(0, decimals) // Keep only allowed decimal places
//   return `${parts[0]}.${decimalPart}`
// }

const SkeletonCommon: React.FC = () => (
  <Wrapper>
    <FormWrapper>
      <Header />
      <Form as="div">
        <FormCards>
          <CardPlaceholder />
          <CardPlaceholder height="266px" />
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
}

const Main = () => {
  const { address, walletChainId } = useWeb3Connection()
  const { tokensByNetwork } = useBridgedTokens()
  const [formState, dispatch] = useReducer(
    (data: BridgeFormState, partial: Partial<BridgeFormState>): BridgeFormState => ({
      ...data,
      ...partial,
    }),
    {
      ...initialState,
      account: address || ZERO_ADDRESS,
    },
  )
  const [debouncedAmount] = useDebounce(formState.amount, 500)

  const amountBN = toBN(debouncedAmount || '0', formState.token?.decimals || 0)

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

    const token = tokensByNetwork[formState.toChainId].find((token) =>
      isSameString(token.address, otherSideToken),
    )

    dispatch({
      ...initialState,
      account: address || ZERO_ADDRESS,
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
    isSameString(formState.token?.address || '', AURA_ETHEREUM)

  const isUsdcEth = isSameString(formState.token?.address || '', USDC_ETHEREUM)
  const isUsdceGC = isSameString(formState.token?.address || '', USDCe_GNOSIS)

  const tokenOut = useBridgeTokenOutInfo({
    fromChainId: formState.fromChainId,
    receiveNativeToken: formState.receiveNativeToken,
    toChainId: formState.toChainId,
    token: formState.token,
  })

  const isNotBridgedErc20 =
    tokenOut?.chainId === 1 && tokenOut.extensions.bridgeInfo[1]?.tokenAddress === ZERO_ADDRESS
      ? true
      : false

  return (
    <Wrapper>
      <FormWrapper>
        <Header />
        <Form>
          <FormCards>
            <InnerCardFrom>
              <Title>Transfer from</Title>
              <OnChainInfo>
                <Chain chainId={formState.fromChainId} />
                <UserBalance
                  address={address}
                  fromChainId={formState.fromChainId}
                  onMax={(value) => dispatch({ ...formState, amount: value })}
                  toChainId={formState.toChainId}
                  token={formState.token}
                />
              </OnChainInfo>
              <BridgedToken>
                <FromTokenDropdown
                  defaultToken={formState.token}
                  fromChainId={formState.fromChainId}
                  key={'tokenIn'}
                  onChange={(token: Token) => {
                    dispatch({ ...formState, token, receiveNativeToken: false, amount: '' })
                  }}
                  toChainId={formState.toChainId}
                />
                <AmountInput
                  decimals={formState.token?.decimals || 18}
                  disabled={isNotBridgedErc20}
                  onChange={(value) => dispatch({ ...formState, amount: value })}
                  placeholder="0.00"
                  value={formState.amount}
                />
              </BridgedToken>
              <Switch onClick={() => handleFromChainIdChange()} />
            </InnerCardFrom>
            <InnerCard>
              <Title>Transfer to</Title>
              {isUsdcEth && <UsdcEthWarning />}
              {isUsdceGC && <UsdcEGcWarning />}
              {unwrapFirst && <UnwrapFirst />}
              {sendToExternalBridge && formState.token && (
                <ExternalBridgeWarning token={formState.token} />
              )}
              {isNotBridgedErc20 && !unwrapFirst && !isUsdceGC && <NotBridgedERC20Warning />}

              {!unwrapFirst && !sendToExternalBridge && !isNotBridgedErc20 && !isUsdceGC && (
                <>
                  <OnChainInfo>
                    <Chain chainId={formState.toChainId} />
                    <UserBalance
                      address={address}
                      /* Inverted values as we need to get the values from the other side of the chain */
                      fromChainId={formState.toChainId}
                      toChainId={formState.fromChainId}
                      token={tokenOut}
                    />
                  </OnChainInfo>
                  <BridgedToken>
                    <ReceivedTokenInfo
                      amountBN={amountBN}
                      fromChainId={formState.fromChainId}
                      setReceiveNativeToken={(receiveNative: boolean) => {
                        dispatch({ ...formState, receiveNativeToken: receiveNative })
                      }}
                      toChainId={formState.toChainId}
                      token={formState.token}
                      tokenOut={tokenOut}
                    />
                  </BridgedToken>
                  <RecipientAddress
                    onChange={(event) => dispatch({ ...formState, recipient: event.target.value })}
                    recipient={formState.recipient}
                  />
                </>
              )}
            </InnerCard>
            {amountBN.gt(0) &&
              formState.token &&
              tokenOut &&
              address &&
              walletChainId == formState.fromChainId && (
                <BridgeSummary
                  amount={amountBN}
                  fromChainId={formState.fromChainId}
                  receiveNativeToken={formState.receiveNativeToken}
                  recipient={formState.recipient}
                  toChainId={formState.toChainId}
                  token={formState.token}
                  tokenOut={tokenOut}
                  userAddress={address}
                />
              )}
          </FormCards>
          {unwrapFirst ? (
            <ButtonUnwrapFirst symbol={formState.token?.symbol} />
          ) : !formState.token ||
            !address ||
            amountBN.eq(0) ||
            sendToExternalBridge ||
            isNotBridgedErc20 ? (
            <DisabledBridgeButton />
          ) : (
            <SafeSuspense fallback={<ButtonPlaceholder />}>
              <BridgeButton
                amount={amountBN}
                fromChainId={formState.fromChainId}
                fromToken={formState.token}
                receiveNativeToken={formState.receiveNativeToken}
                recipient={formState.recipient}
                toChainId={formState.toChainId}
                toToken={tokenOut}
                userAddress={address}
              />
            </SafeSuspense>
          )}
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
