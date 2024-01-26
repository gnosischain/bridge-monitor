import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeInfo } from '@/src/hooks/bridge/useBridgeInfo'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
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
import { fromBN } from '@/src/utils/bigNumber'
import { ZERO_ADDRESS } from '@/src/constants/misc'

const TokenListProvider = dynamic(() => import('@/src/providers/tokenListProvider'), {
  ssr: false,
})

const Wrapper = styled(MainCard)`
  align-items: center;
  padding-top: calc(var(--theme-common-space) * 5);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 8);
  }
`

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 100%;
  row-gap: calc(var(--theme-common-space) * 3);
  width: 100%;
  max-width: 644px;
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
  font-size: 2.8rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 3.2rem;
  }
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
  font-size: 2.1rem;
  font-weight: 500;
  justify-content: space-between;
  line-height: 1.2;
  margin: 0;
  width: 100%;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 2.4rem;
  }
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
type BridgeButtonProps = {
  canBridge: boolean
  isApproving: boolean
  isBridging: boolean
  isLoading: boolean
  shouldApprove: boolean
  bridgeTx?: () => void
  approvalTx?: () => void
  fromChainId: ChainsValues
}
const BridgeButton = ({
  approvalTx,
  bridgeTx,
  canBridge,
  fromChainId,
  isApproving,
  isBridging,
  isLoading,
  shouldApprove,
}: BridgeButtonProps) => {
  const {
    appChainId,
    connectWallet,
    connectingWallet,
    isOnboardChangingChain,
    isWalletConnected,
    isWalletNetworkSupported,
    pushNetwork,
  } = useWeb3Connection()

  const appChainConfig = getNetworkConfig(fromChainId)

  if (isLoading || isOnboardChangingChain || connectingWallet || isApproving || isBridging) {
    return (
      <ButtonPrimary disabled style={{ margin: '0 auto' }}>
        Loading...
      </ButtonPrimary>
    )
  }

  if (!isWalletConnected) {
    return (
      <ButtonPrimary onClick={connectWallet} style={{ margin: '0 auto' }} type="button">
        {connectingWallet ? 'Connecting wallet...' : 'Connect Wallet'}
      </ButtonPrimary>
    )
  }

  if ((isWalletConnected && !isWalletNetworkSupported) || fromChainId !== appChainId) {
    return (
      <ButtonPrimary
        onClick={() => pushNetwork({ chainId: appChainConfig.chainIdHex })}
        style={{ margin: '0 auto' }}
        type="button"
      >
        {`Switch to ${appChainConfig.name}`}
      </ButtonPrimary>
    )
  }

  if (shouldApprove) {
    return (
      <ButtonPrimary onClick={approvalTx} style={{ margin: '0 auto' }} type="button">
        Approve
      </ButtonPrimary>
    )
  }

  return (
    <ButtonPrimary
      disabled={!canBridge}
      onClick={bridgeTx}
      style={{ margin: '0 auto' }}
      type="button"
    >
      Bridge
    </ButtonPrimary>
  )
}

const getToChainId = (fromChainId: ChainsValues) =>
  fromChainId === Chains.mainnet ? Chains.gnosis : Chains.mainnet

const BridgeForm: React.FC = () => {
  const { address, appChainId } = useWeb3Connection()
  const { tokensByNetwork } = useBridgedTokens()
  const approve = useApproval()
  const sendTx = useTransaction()

  const appChainConfig = getNetworkConfig(appChainId)

  const [isBridging, setIsBridging] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [userChecked, setUserChecked] = useState(false)

  const chainsItems = [
    { label: 'Mainnet', value: Chains.mainnet },
    { label: 'Gnosis', value: Chains.gnosis },
  ]

  const [formState, dispatch] = useReducer(
    (data: FormState, partial: Partial<FormState>): FormState => ({
      ...data,
      ...partial,
    }),
    {
      ...initialState,
      account: address || ZERO_ADDRESS,
      fromChainId: appChainId,
      toChainId: getToChainId(appChainId),
    },
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

  const handleResetForm = useCallback(() => {
    setUserChecked(false)
    dispatch({
      ...initialState,
      account: address || ZERO_ADDRESS,
      fromChainId: appChainId,
      toChainId: getToChainId(appChainId),
    })
  }, [address, appChainId])

  const handleFromChainIdChange = async (fromChainId: ChainsValues) => {
    dispatch({
      ...initialState,
      account: address || ZERO_ADDRESS,
      fromChainId: fromChainId,
      toChainId: getToChainId(fromChainId),
    })
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

    setIsApproving(true)
    const parsedAmount = parseUnits(formState.amount, formState.token.decimals)

    const fromTokenAddress = formState.token.address
    const spender = bridgeInfo.fromBridgeAddress

    const tx = await approve({
      amount: parsedAmount,
      spenderAddress: spender,
      tokenAddress: fromTokenAddress,
    })
    if (tx) {
      await tx.wait()
      await bridgeInfo.refreshBalance()
      setIsApproving(false)
    } else {
      setIsApproving(false)
    }
  }, [formState.token, formState.amount, bridgeInfo, approve])

  const handleBridgeTx = useCallback(async () => {
    if (!bridgeInfo.tx) {
      return
    }
    setIsBridging(true)
    try {
      const tx = await sendTx(bridgeInfo.tx)
      if (tx) {
        await tx.wait()
        handleResetForm()
        await bridgeInfo.refreshBalance()
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
      <Form>
        <FormCards>
          <InnerCard>
            <SubTitle>
              From
              <Balance>Balance: {fromBN(bridgeInfo.balance, formState.token?.decimals)}</Balance>
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
                max={fromBN(bridgeInfo.balance, formState.token?.decimals)}
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
                  You will receive: {bridgeInfo.toAmount} {tokenOut?.symbol}
                </div>
                <div>Estimated time: 5 mins</div>
                <div>
                  Estimated total gas:{' '}
                  {fromBN(
                    bridgeInfo.gasLimit.mul(bridgeInfo.gasPrice),
                    appChainConfig.tokenDecimals,
                  )}{' '}
                  {appChainConfig.token}
                </div>
                <div>
                  Estimated total fee: {fromBN(bridgeInfo.fee, appChainConfig.tokenDecimals)}{' '}
                  {formState.token?.symbol}
                </div>
              </>
            )}
          </TransactionInfo>
        </FormCards>
        {bridgeInfo.errorMessage && <ErrorComponent>{bridgeInfo.errorMessage}</ErrorComponent>}
        <div>
          <BridgeButton
            approvalTx={handleApprove}
            bridgeTx={handleBridgeTx}
            canBridge={bridgeInfo.canBridge}
            fromChainId={formState.fromChainId}
            isApproving={isApproving}
            isBridging={isBridging}
            isLoading={bridgeInfo.isLoadingInfo}
            shouldApprove={bridgeInfo.shouldApprove}
          />
        </div>
      </Form>
    </>
  )
}

export const BridgeIndex: React.FC = ({ ...restProps }) => {
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
        <TokenListProvider>
          <BridgeForm />
        </TokenListProvider>
      </InnerWrapper>
    </Wrapper>
  )
}
