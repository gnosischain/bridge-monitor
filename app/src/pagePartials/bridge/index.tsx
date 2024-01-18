import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeInfo } from '@/src/hooks/bridge/useBridgeInfo'
import { useWeb3ConnectedApp, useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { parseUnits } from 'ethers/lib/utils'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { TokenDropdown } from '@/src/pagePartials/bridgeExplorer/bridges/TokenDropdown'
import { Token } from '@/types/token'
import styled from 'styled-components'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { Textfield } from '@/src/components/form/Textfield'
import { Dropdown, DropdownItem } from '@/src/components/dropdown'
import { ButtonPrimary } from '@/src/components/buttons/Button'
import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { notify } from '@/src/components/toast'
import { ToastStates } from '@/src/constants/types'
import { Loading } from '@/src/components/loading'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import useTransaction from '@/src/hooks/useTransaction'
import { AmountTokenInput } from '@/src/components/form/AmountTokenInput'
import { Error as ErrorComponent } from '@/src/components/error/Error'
import { MainCard } from '@/src/components/card/MainCard'
import { Configuration } from '@/src/pagePartials/bridge/Configuration'
import { InnerCard } from '@/src/pagePartials/bridge/InnerCard'
import { TransactionInfo } from '@/src/pagePartials/bridge/TransactionInfo'
import { formatUnits } from '@/src/utils/numberFormat'

const TokenListProvider = dynamic(() => import('@/src/providers/tokenListProvider'), {
  ssr: false,
})

const Wrapper = styled(MainCard)`
  align-items: center;
  padding-top: calc(var(--theme-common-space) * 8);
`

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
  row-gap: calc(var(--theme-common-space) * 3);
  width: 644px;
`

const Header = styled.div`
  align-items: center;
  display: flex;
  column-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
`

const HeaderInner = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--theme-common-space);
  flex-grow: 1;
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 3.2rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
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

const SubTitle = styled.h2`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 2.4rem;
  font-weight: 500;
  justify-content: space-between;
  line-height: 1.2;
  margin: 0;
  width: 100%;
`

const Balance = styled.span`
  color: ${({ theme: { colors } }) => colors.primary};
  line-height: 1.2;
  font-size: 1.6rem;
  font-weight: 300;
`

const ChainDropdown = styled(Dropdown)``

const FromAmountWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  height: 54px;
  border-radius: 8px;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2) var(--theme-common-space)
    var(--theme-common-space);
`

const FromTokenDropdown = styled(TokenDropdown)``

type FormState = {
  fromChainId: ChainsValues
  toChainId: ChainsValues
  amount: string
  recipient: string
  receiveNativeToken: boolean
  account: string
  token?: Token
}

const initialState: FormState = {
  fromChainId: Chains.mainnet,
  toChainId: Chains.gnosis,
  account: '',
  token: undefined,
  amount: '',
  recipient: '',
  receiveNativeToken: false,
}

const BridgeForm: React.FC = () => {
  const { address, appChainId, isOnboardChangingChain, pushNetwork } = useWeb3ConnectedApp()
  const { tokensByNetwork } = useBridgedTokens()
  const approve = useApproval()
  const sendTx = useTransaction()

  const currentChainConfig = getNetworkConfig(appChainId)

  const [isBridging, setIsBridging] = useState(false)
  const [userChecked, setUserChecked] = useState(false)

  const chainsItems = [
    { label: 'Mainnet', value: Chains.mainnet },
    { label: 'Gnosis', value: Chains.gnosis },
  ]

  const formInitialState = useMemo(
    () => ({
      ...initialState,
      account: address,
      fromChainId: appChainId,
      toChainId: appChainId === Chains.mainnet ? Chains.gnosis : Chains.mainnet,
    }),
    [address, appChainId],
  )

  const [formState, dispatch] = useReducer(
    (data: FormState, partial: Partial<FormState>): FormState => ({
      ...data,
      ...partial,
    }),
    formInitialState,
  )

  const bridgeInfo = useBridgeInfo({
    fromChainId: formState.fromChainId as ChainsValues,
    toChainId: formState.toChainId as ChainsValues,
    token: formState.token,
    receiveNativeToken: formState.receiveNativeToken,
    amount: formState.amount,
    recipient: formState.recipient,
  })

  useEffect(() => {
    // Automatically check receive native token if isDAI and isFromForeign
    if (
      !userChecked &&
      bridgeInfo.isDAI &&
      bridgeInfo.isFromForeign &&
      !formState.receiveNativeToken
    ) {
      dispatch({ ...formState, receiveNativeToken: true })
      setUserChecked(false)
    }
  }, [address, bridgeInfo.isDAI, bridgeInfo.isFromForeign, formState, userChecked])

  const tokenOut = useMemo(() => {
    const tokenOutAddress = bridgeInfo.tokenOutAddress
    if (!tokenOutAddress) {
      return undefined
    }

    return tokensByNetwork[formState.toChainId].find(
      ({ address }) => address.toLowerCase() === tokenOutAddress.toLowerCase(),
    )
  }, [bridgeInfo.tokenOutAddress, formState.toChainId, tokensByNetwork])

  const handleFromChainIdChange = async (chainId: ChainsValues) => {
    const fromChainId = chainId
    const chainConfig = getNetworkConfig(fromChainId)

    try {
      const isSwitchedSuccess = await pushNetwork({ chainId: chainConfig.chainIdHex })
      if (isSwitchedSuccess) {
        dispatch(formInitialState)
      } else {
        throw new Error('Failed to switch network')
      }
    } catch (error) {
      notify({
        title: 'Failed to switch network',
        message: `Your wallet must be connected in ${chainConfig.name} network if you want to bridge tokens from this network`,
        type: ToastStates.failed,
      })
    }
  }

  const handleTokenChange = (token: Token) => {
    dispatch({ ...formState, token, receiveNativeToken: false, amount: '' })
  }

  const handleReceiveNativeTokenToggle = () => {
    setUserChecked(true)
    dispatch({ ...formState, receiveNativeToken: !formState.receiveNativeToken })
  }

  const handleApprove = useCallback(async () => {
    if (!formState.token || !bridgeInfo.fromBridgeAddress) {
      return
    }

    const parsedAmount = parseUnits(formState.amount, formState.token.decimals)

    const fromTokenAddress = formState.token.address
    const spender = bridgeInfo.fromBridgeAddress

    try {
      const tx = await approve({
        amount: parsedAmount,
        spenderAddress: spender,
        tokenAddress: fromTokenAddress,
      })
      if (tx) {
        bridgeInfo.refreshBalance()
      }
    } catch (error) {
      notify({
        title: 'Failed to approve',
        type: ToastStates.failed,
      })
    }
  }, [formState.token, formState.amount, bridgeInfo, approve])

  const handleResetForm = useCallback(() => {
    setUserChecked(false)
    dispatch({ ...formInitialState, token: formState.token })
  }, [formInitialState, formState.token])

  const handleBridgeTx = useCallback(async () => {
    if (!bridgeInfo.tx) {
      return
    }
    setIsBridging(true)
    try {
      const tx = await sendTx(bridgeInfo.tx)
      if (tx) {
        handleResetForm()
        bridgeInfo.refreshBalance()
        setIsBridging(false)
      } else {
        throw new Error('Failed to bridge')
      }
    } catch (error) {
      console.log(error)
      setIsBridging(false)
    }
  }, [bridgeInfo, handleResetForm, sendTx])

  return (
    <>
      {isOnboardChangingChain ? (
        <>
          <Loading text="Switching to a different chain..." />
        </>
      ) : (
        <Form>
          <FormCards>
            <InnerCard>
              <SubTitle>
                From
                <Balance>Balance: 0.00</Balance>
              </SubTitle>
              <ChainDropdown
                activeItemHighlight
                activeItemIndex={chainsItems.findIndex(
                  ({ value }) => value === formState.fromChainId,
                )}
                dropdownButton={
                  <ButtonPrimary>
                    {formState.fromChainId === Chains.mainnet ? 'Mainnet' : 'Gnosis'}
                    <ChevronDown />
                  </ButtonPrimary>
                }
                items={chainsItems.map((chainItem) => (
                  <DropdownItem
                    key={chainItem.value}
                    onClick={() => handleFromChainIdChange(chainItem.value)}
                  >
                    {chainItem.label}
                  </DropdownItem>
                ))}
              />
              <FromAmountWrapper>
                <FromTokenDropdown
                  chainId={formState.fromChainId}
                  defaultToken={formState.token}
                  key={'tokenIn'}
                  onChange={handleTokenChange}
                />
                <AmountTokenInput
                  max={
                    bridgeInfo.balance.gt(0)
                      ? formatUnits({
                          value: bridgeInfo.balance,
                          decimals: formState.token?.decimals || 18,
                        })
                      : undefined
                  }
                  onChange={(value) => dispatch({ ...formState, amount: value })}
                  placeholder="0.00"
                  value={formState.amount}
                />
              </FromAmountWrapper>
            </InnerCard>
            <InnerCard>
              <SubTitle>To</SubTitle>
              <Textfield
                id="toChainId"
                readOnly
                type="text"
                value={formState.toChainId == 100 ? 'gnosis' : 'mainnet'}
              />
              <TokenDropdown
                chainId={formState.toChainId}
                defaultToken={tokenOut}
                disabled
                key={'tokenOut'}
              />
              <div>
                <label htmlFor="receiveNativeToken">Receive Native Token: </label>
                <input
                  checked={formState.receiveNativeToken}
                  disabled={!bridgeInfo.canReceiveNativeToken}
                  id="receiveNativeToken"
                  onChange={handleReceiveNativeTokenToggle}
                  type="checkbox"
                />
              </div>
              <div>
                <label htmlFor="amount">Send to different wallet:</label>
                <Textfield
                  onChange={(event) => dispatch({ ...formState, recipient: event.target.value })}
                  type="text"
                  value={formState.recipient}
                />
              </div>
            </InnerCard>
            <TransactionInfo>
              {bridgeInfo.isLoadingInfo ? (
                <Loading text="Loading..." />
              ) : (
                <>
                  <div>
                    You will receive: {bridgeInfo.toAmount.toString()} {tokenOut?.symbol}
                  </div>
                  <div>Estimated time: 5 mins</div>
                  <div>
                    Estimated total gas:{' '}
                    {formatUnits({
                      value: bridgeInfo.gasLimit.mul(bridgeInfo.gasPrice),
                      decimals: currentChainConfig.tokenDecimals,
                      symbolPosition: 'after',
                      symbol: currentChainConfig.token,
                    })}
                  </div>
                  <div>
                    Estimated total fee:{' '}
                    {formatUnits({
                      value: bridgeInfo.fee,
                      decimals: formState.token?.decimals || 18,
                      symbolPosition: 'after',
                      symbol: formState.token?.symbol,
                    })}
                  </div>
                </>
              )}
            </TransactionInfo>
          </FormCards>
          {bridgeInfo.errorMessage && <ErrorComponent>{bridgeInfo.errorMessage}</ErrorComponent>}
          <div>
            {bridgeInfo.shouldApprove ? (
              <ButtonPrimary onClick={handleApprove} style={{ margin: '0 auto' }} type="button">
                Approve
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                disabled={!bridgeInfo.canBridge || isBridging}
                onClick={handleBridgeTx}
                style={{ margin: '0 auto' }}
                type="button"
              >
                Bridge
              </ButtonPrimary>
            )}
          </div>
        </Form>
      )}
    </>
  )
}

export const BridgeIndex: React.FC = ({ ...restProps }) => {
  const { isAppConnected } = useWeb3Connection()

  return (
    <Wrapper {...restProps}>
      <InnerWrapper>
        <Header>
          <HeaderInner>
            <Title>Bridge</Title>
            <Text>Transfer assets between Ethereum and Gnosis Chain. </Text>
          </HeaderInner>
          <Configuration />
        </Header>
        {isAppConnected ? (
          <TokenListProvider>
            <BridgeForm />
          </TokenListProvider>
        ) : (
          <>
            Form should be here even if the user didn't connect their wallet.
            <ButtonPrimary>Connect</ButtonPrimary>
          </>
        )}
      </InnerWrapper>
    </Wrapper>
  )
}
