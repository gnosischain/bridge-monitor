import { Chains, ChainsValues } from '@/src/constants/config/types'
import { useBridgeBalance, useBridgeInfo } from '@/src/hooks/bridge/useBridgeInfo'
import { useWeb3ConnectedApp, useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useReducer } from 'react'
import { TokenDropdown } from '@/src/pagePartials/bridgeExplorer/bridges/TokenDropdown'
import { Token } from '@/types/token'
import { SimpleGrid } from '@/src/components/helpers/SimpleGrid'
import { DebounceInput } from 'react-debounce-input'
import styled from 'styled-components'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { Textfield } from '@/src/components/form/Textfield'
import { Dropdown as BaseDropdown, DropdownItem } from '@/src/components/dropdown'
import { Button } from '@/src/components/buttons/Button'
import { ChevronDown } from '@/src/components/assets/ChevronDown'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { notify } from '@/src/components/toast'
import { ToastStates } from '@/src/constants/types'
import { Loading } from '@/src/components/loading'
import { useApproval } from '@/src/hooks/bridge/useApproval'

const TokenListProvider = dynamic(() => import('@/src/providers/tokenListProvider'), {
  ssr: false,
})

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding: 20px;
  border-radius: 10px;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  justify-content: center;
`

const Dropdown = styled(BaseDropdown)`
  button {
    background-color: ${({ theme: { colors } }) => colors.darkerGrey};
    border-radius: 4px;
    color: ${({ theme: { colors } }) => colors.cream};
    flex-shrink: 0;
    height: 30px;
    font-size: 1.4rem;
  }
`

const FormWrapper = styled.div`
  background: ${({ theme: { colors } }) => colors.lightGrey};
  border-radius: 10px;
  padding: 20px;
  max-width: 50%;
  min-width: 400px;
  margin: 0 auto;
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

const BridgeForm: React.FC = () => {
  const { address, appChainId, isOnboardChangingChain, pushNetwork } = useWeb3ConnectedApp()
  const { tokensByNetwork } = useBridgedTokens()
  const approve = useApproval()

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
      account: address,
      recipient: address,
      fromChainId: appChainId,
      toChainId: appChainId === 1 ? 100 : 1,
    },
  )

  const bridgeBalances = useBridgeBalance({
    account: formState.account,
    fromChainId: formState.fromChainId as ChainsValues,
    token: formState.token,
  })

  const bridgeInfo = useBridgeInfo({
    account: formState.account,
    fromChainId: formState.fromChainId as ChainsValues,
    toChainId: formState.toChainId as ChainsValues,
    token: formState.token,
    receiveNativeToken: formState.receiveNativeToken,
    amount: formState.amount,
    allowance: bridgeBalances.data?.allowance,
  })

  const tokenOut = useMemo(() => {
    const tokenOutAddress = bridgeInfo.data?.tokenOutAddress
    if (!tokenOutAddress) {
      return undefined
    }

    return tokensByNetwork[formState.toChainId].find(
      ({ address }) => address.toLowerCase() === tokenOutAddress.toLowerCase(),
    )
  }, [bridgeInfo.data?.tokenOutAddress, formState.toChainId, tokensByNetwork])

  const handleFromChainIdChange = async (chainId: ChainsValues) => {
    const fromChainId = chainId
    const chainConfig = getNetworkConfig(fromChainId)

    try {
      const isSwitchedSuccess = await pushNetwork({ chainId: chainConfig.chainIdHex })
      if (isSwitchedSuccess) {
        dispatch({
          ...formState,
          token: undefined,
          fromChainId,
          toChainId: fromChainId === 1 ? 100 : 1,
        })
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
    dispatch({ ...formState, token, receiveNativeToken: false })
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value
    // disable not non numeric values
    if (isNaN(Number(amount))) {
      return
    }

    dispatch({ ...formState, amount })
  }

  const handleReceiveNativeTokenToggle = () => {
    dispatch({ ...formState, receiveNativeToken: !formState.receiveNativeToken })
  }

  const handleApprove = useCallback(async () => {
    if (!formState.token || !bridgeInfo.data?.fromBridgeAddress) {
      return
    }

    const parsedAmount = parseUnits(formState.amount, formState.token.decimals)

    const fromTokenAddress = formState.token.address
    const spender = bridgeInfo.data?.fromBridgeAddress

    try {
      await approve({
        amount: parsedAmount,
        spenderAddress: spender,
        tokenAddress: fromTokenAddress,
      })
      // refresh bridge info to update allowance
      bridgeInfo.mutate()
    } catch (error) {
      notify({
        title: 'Failed to approve',
        type: ToastStates.failed,
      })
    }
  }, [formState.token, formState.amount, bridgeInfo, approve])

  return (
    <FormWrapper>
      {isOnboardChangingChain ? (
        <>
          <Loading text="Changing chain..." />
        </>
      ) : (
        <form>
          <div>
            <SimpleGrid>
              <label htmlFor="fromChainId">Origin Chain:</label>
              <Dropdown
                activeItemHighlight
                activeItemIndex={chainsItems.findIndex(
                  ({ value }) => value === formState.fromChainId,
                )}
                dropdownButton={
                  <Button type="button">
                    {formState.fromChainId === Chains.mainnet ? 'Mainnet' : 'Gnosis'}
                    <ChevronDown />
                  </Button>
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
            </SimpleGrid>
            <br />
          </div>
          <div>
            <SimpleGrid>
              <label htmlFor="toChainId">Destination Chain:</label>
              <Textfield
                id="toChainId"
                readOnly
                type="text"
                value={formState.toChainId == 100 ? 'gnosis' : 'mainnet'}
              />
            </SimpleGrid>
            <br />
          </div>
          <div>
            <SimpleGrid>
              <label htmlFor="token">Token in: </label>
              <TokenDropdown
                chainId={formState.fromChainId}
                defaultToken={formState.token}
                key={'tokenIn'}
                onChange={handleTokenChange}
              />
            </SimpleGrid>
            <br />
          </div>
          <div>
            <SimpleGrid>
              <label htmlFor="token">Token Out: </label>
              <TokenDropdown
                chainId={formState.toChainId}
                defaultToken={tokenOut}
                disabled
                key={'tokenOut'}
              />
              <div>
                <label htmlFor="receiveNativeToken">
                  Receive Native Token:
                  <input
                    checked={formState.receiveNativeToken}
                    disabled={!bridgeInfo.data?.canReceiveNativeToken}
                    id="receiveNativeToken"
                    onChange={handleReceiveNativeTokenToggle}
                    type="checkbox"
                  />
                </label>
              </div>
            </SimpleGrid>
            <br />
          </div>
          <div>
            <SimpleGrid>
              <label htmlFor="amount">Amount:</label>
              <DebounceInput
                debounceTimeout={300}
                element={Textfield}
                onChange={handleAmountChange}
                placeholder={'0.00'}
                value={formState.amount}
              />
            </SimpleGrid>
            <br />
          </div>
          <div>
            <SimpleGrid>
              <label htmlFor="amount">Recipient:</label>
              <Textfield
                onChange={(event) => dispatch({ ...formState, account: event.target.value })}
                type="text"
                value={formState.account}
              />
            </SimpleGrid>
            <br />
          </div>
          <div style={{ background: 'white', color: 'black' }}>
            <div>Bridge Info:</div>
            <div>
              balance:{' '}
              {bridgeBalances.data?.balance && formState.token
                ? formatUnits(bridgeBalances.data?.balance.toString(), formState.token.decimals)
                : '-'}
            </div>
            <div>
              allowance:{' '}
              {bridgeBalances.data &&
                formState.token &&
                formatUnits(bridgeBalances.data.allowance, formState.token?.decimals)}
            </div>
            <div>token: {bridgeInfo.data?.tokenOutAddress}</div>
            <div>fee: {bridgeInfo.data?.fee.toString()}</div>
          </div>

          <br />
          <div style={{ textAlign: 'center' }}>
            {bridgeInfo.data?.shouldApprove ? (
              <Button onClick={handleApprove} style={{ margin: '0 auto' }} type="button">
                Approve
              </Button>
            ) : (
              <Button style={{ margin: '0 auto' }} type="submit">
                Bridge
              </Button>
            )}
          </div>
        </form>
      )}
    </FormWrapper>
  )
}

export const BridgeIndex: React.FC = ({ ...restProps }) => {
  const { isAppConnected } = useWeb3Connection()

  return (
    <Wrapper {...restProps}>
      {isAppConnected ? (
        <TokenListProvider>
          <BridgeForm />
        </TokenListProvider>
      ) : (
        <div>Connect your wallet</div>
      )}
    </Wrapper>
  )
}
