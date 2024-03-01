import { useCallback, useReducer, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import useTransaction from '@/src/hooks/useTransaction'
import { AlertMessage } from '@/src/components/error/AlertMessage'
import { AmountTokenInput, MaxButton } from '@/src/pagePartials/bridge/AmountTokenInput'
import { AnimatePresence } from 'framer-motion'
import { BridgeButton, ButtonPlaceholder } from '@/src/pagePartials/bridge/BridgeButton'
import { RecipientAddress } from '@/src/pagePartials/bridge/RecipientAddress'
import { CardPlaceholder } from '@/src/pagePartials/bridge/CardPlaceholder'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { TokenSelect } from '@/src/pagePartials/bridge/TokenSelect'
import { Header } from '@/src/pagePartials/bridge/Header'
import { InnerCard } from '@/src/pagePartials/bridge/InnerCard'
import { ButtonUnwrapFirst, UnwrapFirst } from '@/src/pagePartials/bridge/UnwrapFirst'
import { MainCard } from '@/src/components/card/MainCard'
import { Success } from '@/src/pagePartials/bridge/Success'
import { Switch } from '@/src/pagePartials/bridge/Switch'
import { Token } from '@/types/token'
import { TokenDropdown } from '@/src/pagePartials/bridge/TokenDropdown'
import { TokenOut } from '@/src/pagePartials/bridge/TokenOut'
import { TxPreview } from '@/src/pagePartials/bridge/TxPreview'
import { WXDAI_GNOSIS, ZERO_ADDRESS, ZERO_BN, sDAI_GNOSIS } from '@/src/constants/misc'
import { chainsConfig, getNetworkConfig } from '@/src/constants/config/chains'
import { formatNumber } from '@/src/utils/format'
import { fromBN } from '@/src/utils/bigNumber'
import { genericSuspense } from '@/src/components/safeSuspense'
import { parseUnits } from 'ethers/lib/utils'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { useBridgeInfo } from '@/src/hooks/bridge/useBridgeInfo'
import { getToChainId, isSameString } from '@/src/utils/tools'
import { getIcon } from '@/src/utils/icons'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Balance } from '@/src/pagePartials/bridge/Balance'

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

const InnerWrapper = styled.div<{ hidden?: boolean }>`
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

const SubTitle = styled.h2`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 2.1rem;
  font-weight: 500;
  justify-content: space-between;
  line-height: 1.2;
  margin: 0;
  padding-bottom: calc(var(--theme-common-space) * 3);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 2.4rem;
  }
`

const Chain = styled.div`
  --chain-height: 44px;

  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: var(--chain-height);
  display: flex;
  column-gap: var(--theme-common-space);
  height: var(--chain-height);
  padding: var(--theme-common-space);
  font-size: 1.8rem;
  font-weight: 500;
`

const BalanceWrapper = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  margin-left: auto;
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

const TokenInput = styled(AmountTokenInput)`
  margin-right: calc(var(--theme-common-space) * -1);
`

const DifferentWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
`

const SkeletonCommon: React.FC = () => (
  <>
    <Header />
    <FormCards>
      <CardPlaceholder />
      <CardPlaceholder height="266px" />
    </FormCards>
    <ButtonPlaceholder />
  </>
)

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

const BridgeForm: React.FC = genericSuspense(
  () => {
    const [isBridging, setIsBridging] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const { address, appChainId } = useWeb3Connection()
    const approve = useApproval()
    const sendTx = useTransaction()

    const appChainConfig = getNetworkConfig(appChainId)

    const [formState, dispatch] = useReducer(
      (data: FormState, partial: Partial<FormState>): FormState => ({
        ...data,
        ...partial,
      }),
      {
        ...initialState,
        account: address || ZERO_ADDRESS,
      },
    )

    // TODO: REFACTOR having this one big unified hook is not a good idea.
    // It tries to get all the data, even when it's not needed.
    // The best approach is to call the hooks on the components that are required
    // and have the possibility to conditionally render these components.
    const bridgeInfo = useBridgeInfo({
      fromChainId: formState.fromChainId as ChainsValues,
      toChainId: formState.toChainId as ChainsValues,
      token: formState.token,
      receiveNativeToken: formState.receiveNativeToken,
      amount: formState.amount,
      recipient: formState.recipient,
    })

    const tokenOut = bridgeInfo.receivedToken

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

    const handleApprove = async () => {
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
    }

    const onGoBack = () => {
      setShowSuccess(false)
    }

    const handleBridgeTx = async () => {
      if (!bridgeInfo.tx) {
        return
      }

      setIsBridging(true)

      try {
        const tx = await sendTx(bridgeInfo.tx)
        setShowSuccess(true)

        if (tx) {
          await tx.wait()
          handleResetForm()
          await bridgeInfo.refreshBalance()
          setIsBridging(false)
        } else {
          throw new Error('Failed to bridge')
        }
      } catch (error) {
        console.error(error)
        setIsBridging(false)
      }
    }

    const wethOptions = [
      {
        icon: '/images/icons/wethToken.svg',
        label: 'WETH',
        name: 'eth-types',
      },
      {
        icon: '/images/icons/ethToken.svg',
        label: 'ETH',
        name: 'eth-types',
      },
    ]

    const radioGroupHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value === 'WETH') {
        dispatch({ ...formState, receiveNativeToken: !formState.receiveNativeToken })
      } else {
        dispatch({ ...formState, receiveNativeToken: !formState.receiveNativeToken })
      }
    }

    const unwrapFirst =
      formState.fromChainId == Chains.gnosis &&
      (isSameString(formState.token?.address || '', WXDAI_GNOSIS) ||
        isSameString(formState.token?.address || '', sDAI_GNOSIS))

    const tokenOutValue = formatNumber(Number(bridgeInfo.toAmount))

    return (
      <>
        {/* This needs a refactoring (start with the big hook at the beginning of this component...) */}
        {showSuccess && <Success onGoBack={onGoBack} />}
        <InnerWrapper hidden={showSuccess}>
          <Header />
          <Form>
            <FormCards>
              <InnerCardFrom>
                <SubTitle>
                  From
                  <Chain>
                    <Image
                      alt={formState.fromChainId === Chains.mainnet ? 'MainnetBig' : 'GnosisBig'}
                      height={24}
                      objectFit="cover"
                      src={getIcon(
                        formState.fromChainId === Chains.mainnet ? 'MainnetBig' : 'GnosisBig',
                      )}
                      width={24}
                    />
                    {formState.toChainId === 100 ? 'Mainnet' : 'Gnosis'}
                  </Chain>
                </SubTitle>
                <BalanceWrapper>
                  <MaxButton
                    disabled={bridgeInfo.balance.isZero()}
                    onClick={() =>
                      dispatch({
                        ...formState,
                        amount: fromBN(bridgeInfo.balance, formState.token?.decimals),
                      })
                    }
                  />
                  <Balance
                    loading={bridgeInfo.isLoadingInfo}
                    token={formState.token}
                    value={formatNumber(
                      Number(fromBN(bridgeInfo.balance, formState.token?.decimals)),
                    )}
                  />
                </BalanceWrapper>
                <BridgedToken>
                  <FromTokenDropdown
                    defaultToken={formState.token}
                    fromChainId={formState.fromChainId}
                    key={'tokenIn'}
                    onChange={handleTokenChange}
                    toChainId={formState.toChainId}
                  />
                  <TokenInput
                    onChange={(value) => dispatch({ ...formState, amount: value })}
                    placeholder="0.00"
                    value={formState.amount}
                  />
                </BridgedToken>
                <Switch
                  onClick={() => handleFromChainIdChange(formState.toChainId === 100 ? 100 : 1)}
                />
              </InnerCardFrom>
              <InnerCard>
                <SubTitle>
                  To
                  <Chain>
                    <Image
                      alt={formState.fromChainId === Chains.gnosis ? 'Mainnet' : 'Gnosis'}
                      height={24}
                      objectFit="cover"
                      src={getIcon(
                        formState.fromChainId === Chains.gnosis ? 'MainnetBig' : 'GnosisBig',
                      )}
                      width={24}
                    />
                    {formState.toChainId === 100 ? 'Gnosis' : 'Mainnet'}
                  </Chain>
                </SubTitle>
                {unwrapFirst ? (
                  <UnwrapFirst />
                ) : (
                  <>
                    <BalanceWrapper>
                      <Balance
                        loading={bridgeInfo.isLoadingTokenOutInfo}
                        token={bridgeInfo.receivedToken}
                        value={
                          bridgeInfo.receivedToken
                            ? formatNumber(
                                Number(
                                  fromBN(
                                    bridgeInfo.userBalanceInDestination || ZERO_BN,
                                    bridgeInfo.receivedToken.decimals,
                                  ),
                                ),
                              )
                            : ''
                        }
                      />
                    </BalanceWrapper>
                    <BridgedToken>
                      {formState.fromChainId == Chains.gnosis &&
                      formState.token?.address ==
                        chainsConfig[Chains.gnosis].bridge.wForeignNative ? (
                        <TokenSelect
                          onChange={radioGroupHandler}
                          options={wethOptions}
                          optionsId="ethOptions"
                          value={tokenOutValue}
                        />
                      ) : (
                        <TokenOut
                          loading={bridgeInfo.isLoadingTokenOutInfo}
                          tokenOut={tokenOut}
                          value={tokenOutValue}
                        />
                      )}
                    </BridgedToken>
                    <DifferentWalletWrapper>
                      <RecipientAddress
                        onChange={(event) =>
                          dispatch({ ...formState, recipient: event.target.value })
                        }
                        recipient={formState.recipient}
                      />
                    </DifferentWalletWrapper>
                  </>
                )}
              </InnerCard>
              {!bridgeInfo.errorMessage && (
                <AnimatePresence initial={false}>
                  {formState.amount && formState.token && (
                    <TxPreview
                      estimatedTime={bridgeInfo.estimatedTimeInSeconds || 0}
                      estimatedTotalFee={`${fromBN(bridgeInfo.fee, appChainConfig.tokenDecimals)} ${
                        formState.token?.symbol
                      }`}
                      estimatedTotalGas={`${fromBN(
                        bridgeInfo.gasLimit.mul(bridgeInfo.gasPrice),
                        appChainConfig.tokenDecimals,
                      )} ${appChainConfig.token}`}
                      isLoading={bridgeInfo.isLoadingInfo}
                      receivedAmount={`${tokenOutValue} ${tokenOut?.symbol}`}
                    />
                  )}
                </AnimatePresence>
              )}
              {bridgeInfo.errorMessage && <AlertMessage text={bridgeInfo.errorMessage} />}
            </FormCards>
            {unwrapFirst ? (
              <ButtonUnwrapFirst symbol={formState.token?.symbol} />
            ) : (
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
            )}
          </Form>
        </InnerWrapper>
      </>
    )
  },
  () => {
    return <SkeletonCommon />
  },
)

export const BridgeIndex: React.FC = genericSuspense(
  ({ ...restProps }) => {
    return (
      <Wrapper {...restProps}>
        <TokenListProvider>
          <BridgeForm />
        </TokenListProvider>
      </Wrapper>
    )
  },
  ({ ...restProps }) => {
    return (
      <Wrapper {...restProps}>
        <InnerWrapper>
          <SkeletonCommon />
        </InnerWrapper>
      </Wrapper>
    )
  },
)
