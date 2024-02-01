import Image from 'next/image'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeInfo } from '@/src/hooks/bridge/useBridgeInfo'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { parseUnits } from 'ethers/lib/utils'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useReducer, useState } from 'react'
import { TokenDropdown } from '@/src/pagePartials/bridgeExplorer/bridges/TokenDropdown'
import { Token } from '@/types/token'
import styled, { css } from 'styled-components'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { Textfield } from '@/src/components/form/Textfield'
import { ButtonFullPrimary } from '@/src/components/buttons/Button'
import { chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import { Loading } from '@/src/components/loading'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import useTransaction from '@/src/hooks/useTransaction'
import { AmountTokenInput } from '@/src/components/form/AmountTokenInput'
import { MainCard } from '@/src/components/card/MainCard'
import { InnerCard } from '@/src/pagePartials/bridge/InnerCard'
import { TransactionInfo } from '@/src/pagePartials/bridge/TransactionInfo'
import { fromBN } from '@/src/utils/bigNumber'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { Connect } from '@/src/components/assets/Connect'
import { Tooltip } from '@/src/components/tooltip'
import { AlertMessage } from '@/src/components/error/AlertMessage'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { useIcon } from '@/src/hooks/useIcon'
import { SwitcherArrows } from '@/src/components/assets/SwitcherArrows'
import { ToggleSwitch } from '@/src/components/form/ToggleSwitch'
import { AnimatePresence, motion } from 'framer-motion'
import { formatNumber } from '@/src/utils/format'
import { ChevronDown } from '@/src/components/assets/ChevronDown'

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
const InnerCardFrom = styled(InnerCard)`
  position: relative;
  padding-bottom: calc(var(--theme-common-space) * 5);
`
const Switch = styled.button`
  border-radius: 50%;
  height: 50px;
  width: 50px;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 4px auto 0;
  transform: translateY(29px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme: { colors } }) => colors.white};
  color: ${({ theme: { colors } }) => colors.primary};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  box-shadow: 0px 2.231px 2.775px 0px rgba(0, 0, 0, 0.01), 0px 10.2px 7.8px 0px rgba(0, 0, 0, 0.01),
    0px 25.819px 20.925px 0px rgba(0, 0, 0, 0.02), 0px 51px 48px 0px rgba(0, 0, 0, 0.03);
  &:hover {
    color: ${({ theme: { colors } }) => colors.primaryLight};
  }
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
  display: flex;
  align-items: center;
  gap: 4px;
  span {
    font-weight: 300;
    opacity: 0.7;
  }
`

const FromAmountWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  height: 54px;
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  column-gap: calc(var(--theme-common-space) / 2);
  display: flex;
  padding: calc(var(--theme-common-space) / 2) var(--theme-common-space)
    calc(var(--theme-common-space) / 2) var(--theme-common-space);
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) / 2) calc(var(--theme-common-space) * 2)
      calc(var(--theme-common-space) / 2) var(--theme-common-space);
  }
`

const FromTokenDropdown = styled(TokenDropdown)`
  height: 100%;
  & > div:first-child,
  button {
    height: 100%;
  }
`

const BridgeInfoUl = styled.ul`
  margin: 0;
  padding: 0;
  font-size: 1.4rem;
  li {
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--theme-common-space) 0 0;
    &:not(:last-child) {
      padding: var(--theme-common-space) 0;
      border-bottom: 1px solid ${({ theme: { colors } }) => colors.cream};
    }

    span {
      display: flex;
      gap: var(--theme-common-space);
      align-items: center;
    }
  }
`

const ChainTokenInformation = styled.div`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 2);
  height: 54px;
  display: flex;
  align-items: center;
  gap: 8px;
`
const ToggleSwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`
const DifferentWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
`
const DifferentWalletButton = styled.button<{ isOpen: boolean }>`
  border: none;
  background-color: transparent;
  color: var(--Forest, #3e6957);
  text-align: right;
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  gap: var(--theme-common-space);
  margin-left: auto;
  padding: 0 var(--theme-common-space);
  cursor: pointer;
  svg {
    width: 12px;
    ${({ isOpen }) =>
      isOpen &&
      css`
        transform: rotate(180deg);
      `}
  }
`

const RecipientAddress = styled(motion.div)`
  border-radius: var(--theme-common-space);
  border: 1px solid var(--Cream, #f0ebde);
  display: flex;
  padding: calc(var(--theme-common-space) * 2) var(--theme-common-space);
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme: { common } }) => common.borderRadiusBig};
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2);
  }
`
const RecipientAddressHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
`

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
      <ButtonFullPrimary disabled style={{ margin: '0 auto' }}>
        Loading...
      </ButtonFullPrimary>
    )
  }

  if (!isWalletConnected) {
    return (
      <ButtonFullPrimary onClick={connectWallet} style={{ margin: '0 auto' }} type="button">
        {connectingWallet ? (
          'Connecting wallet...'
        ) : (
          <>
            <Connect /> Connect Wallet
          </>
        )}
      </ButtonFullPrimary>
    )
  }

  if ((isWalletConnected && !isWalletNetworkSupported) || fromChainId !== appChainId) {
    return (
      <ButtonFullPrimary
        onClick={() => pushNetwork({ chainId: appChainConfig.chainIdHex })}
        style={{ margin: '0 auto' }}
        type="button"
      >
        {`Switch to ${appChainConfig.name}`}
      </ButtonFullPrimary>
    )
  }

  if (shouldApprove) {
    return (
      <ButtonFullPrimary onClick={approvalTx} style={{ margin: '0 auto' }} type="button">
        Approve
      </ButtonFullPrimary>
    )
  }

  return (
    <ButtonFullPrimary
      disabled={!canBridge}
      onClick={bridgeTx}
      style={{ margin: '0 auto' }}
      type="button"
    >
      Bridge
    </ButtonFullPrimary>
  )
}

const getToChainId = (fromChainId: ChainsValues) =>
  fromChainId === Chains.mainnet ? Chains.gnosis : Chains.mainnet

const BridgeForm: React.FC = () => {
  const [isBridging, setIsBridging] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const { address, appChainId } = useWeb3Connection()
  const { tokensByNetwork } = useBridgedTokens()
  const approve = useApproval()
  const sendTx = useTransaction()

  const appChainConfig = getNetworkConfig(appChainId)
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

  const IconPathURL = (label: string) => {
    return useIcon(label).iconPath
  }
  const [isDifferentWalletOpen, setIsDifferentWalletOpen] = useState(false)

  return (
    <>
      <Form>
        <FormCards>
          <InnerCardFrom>
            <SubTitle>
              From
              <Balance>
                <span>Balance:</span>{' '}
                {formState.token && (
                  <TokenIcon
                    dimensions={16}
                    iconSource={formState.token?.logoURI}
                    symbol={formState.token?.symbol}
                  />
                )}{' '}
                {formatNumber(Number(fromBN(bridgeInfo.balance, formState.token?.decimals)))}
              </Balance>
            </SubTitle>
            <ChainTokenInformation>
              <Image
                alt={formState.fromChainId === Chains.mainnet ? 'MainnetBig' : 'GnosisBig'}
                height={24}
                objectFit="cover"
                src={IconPathURL(
                  formState.fromChainId === Chains.mainnet ? 'MainnetBig' : 'GnosisBig',
                )}
                width={24}
              />
              {formState.toChainId === 100 ? 'Mainnet' : 'Gnosis'}
            </ChainTokenInformation>
            
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
            <Switch
              onClick={() => handleFromChainIdChange(formState.toChainId === 100 ? 100 : 1)}
              type="button"
            >
              <SwitcherArrows />
            </Switch>
          </InnerCardFrom>
          <InnerCard>
            <SubTitle>To</SubTitle>
            <ChainTokenInformation>
              <Image
                alt={formState.fromChainId === Chains.gnosis ? 'Mainnet' : 'Gnosis'}
                height={24}
                objectFit="cover"
                src={IconPathURL(
                  formState.fromChainId === Chains.gnosis ? 'MainnetBig' : 'GnosisBig',
                )}
                width={24}
              />
              {formState.toChainId === 100 ? 'Gnosis' : 'Mainnet'}
            </ChainTokenInformation>

            <ChainTokenInformation>
              {tokenOut ? (
                <>
                  <TokenIcon
                    dimensions={24}
                    iconSource={tokenOut.logoURI}
                    symbol={tokenOut.symbol}
                  />
                  {tokenOut.symbol}{' '}
                </>
              ) : (
                'Please select an origin token'
              )}
            </ChainTokenInformation>

            {formState.fromChainId == Chains.gnosis &&
              formState.token?.address == chainsConfig[Chains.gnosis].bridge.wForeignNative && (
                <ToggleSwitchWrapper>
                  <label htmlFor="receiveNativeToken">Receive Native Token </label>
                  <ToggleSwitch
                    checked={formState.receiveNativeToken}
                    id="receiveNativeToken"
                    onChange={handleReceiveNativeTokenToggle}
                  />
                </ToggleSwitchWrapper>
              )}
            <DifferentWalletWrapper>
              <DifferentWalletButton
                isOpen={isDifferentWalletOpen}
                onClick={() =>
                  setIsDifferentWalletOpen((isDifferentWalletOpen) => !isDifferentWalletOpen)
                }
                type="button"
              >
                Send to different wallet <ChevronDown />
              </DifferentWalletButton>
              <AnimatePresence initial={false}>
                {isDifferentWalletOpen && (
                  <RecipientAddress
                    animate={{ height: 'auto', y: 0, opacity: 1 }}
                    exit={{ height: 0, y: '-10%', opacity: 0 }}
                    initial={{ height: 0, y: '-10%', opacity: 0 }}
                    key="wallet"
                    transition={{
                      type: 'tween',
                      duration: 0.15,
                      ease: 'easeInOut',
                    }}
                  >
                    <RecipientAddressHeader>Recipient Address </RecipientAddressHeader>
                    <Textfield
                      onChange={(event) =>
                        dispatch({ ...formState, recipient: event.target.value })
                      }
                      type="text"
                      value={formState.recipient}
                    />
                  </RecipientAddress>
                )}
              </AnimatePresence>
            </DifferentWalletWrapper>
          </InnerCard>
          {formState.amount && formState.token && (
            <TransactionInfo>
              {bridgeInfo.isLoadingInfo ? (
                <Loading text="Loading..." />
              ) : (
                <BridgeInfoUl>
                  <li>
                    You will receive{' '}
                    <span>
                      {formatNumber(Number(bridgeInfo.toAmount))} {tokenOut?.symbol}{' '}
                      <Tooltip content="Estimated output" />
                    </span>
                  </li>
                  <li>
                    Estimated time
                    <span>
                      5 mins <Tooltip content="Estimated execution time" />
                    </span>
                    {/* TODO */}
                  </li>
                  <li>
                    Estimated total gas
                    <span>
                      {fromBN(
                        bridgeInfo.gasLimit.mul(bridgeInfo.gasPrice),
                        appChainConfig.tokenDecimals,
                      )}{' '}
                      {appChainConfig.token}
                      <Tooltip content="Estimated gas fee" />
                    </span>
                  </li>
                  <li>
                    Estimated total fee
                    <span>
                      {fromBN(bridgeInfo.fee, appChainConfig.tokenDecimals)}{' '}
                      {formState.token?.symbol}
                      <Tooltip content="Estimated bridge fees" />
                    </span>
                  </li>
                </BridgeInfoUl>
              )}
            </TransactionInfo>
          )}

          {bridgeInfo.errorMessage && <AlertMessage text={bridgeInfo.errorMessage} />}
        </FormCards>

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
        </Header>
        <TokenListProvider>
          <BridgeForm />
        </TokenListProvider>
      </InnerWrapper>
    </Wrapper>
  )
}
