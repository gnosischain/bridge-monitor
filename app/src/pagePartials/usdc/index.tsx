import { useReducer } from 'react'
import styled from 'styled-components'
import { AmountTokenInput } from '@/src/pagePartials/bridge/bridgeForm/AmountTokenInput'
import { ButtonPlaceholder, DisabledTransButton, TransButton } from './TransButton'
import { CardPlaceholder } from '@/src/pagePartials/bridge/bridgeForm/CardPlaceholder'
import { Header } from './Header'
import { InnerCard } from './InnerCard'
import { Switch } from './Switch'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import SafeSuspense from '@/src/components/safeSuspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useDebounce } from 'use-debounce'
import { UsdcTransFormState } from './types'
import { TokenInfo } from './TokenInfo'
import { UserBalance } from './UserBalance'
import { TransSummary } from './TransSummary'
import { MainCard } from '@/src/components/card/MainCard'
import { usdcTokens } from '@/src/constants/usdcTokens'
import { parseUnits } from 'viem'

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

const AmountInput = styled(AmountTokenInput)`
  margin-right: calc(var(--theme-common-space) * -1);
`

export const Wrapper = styled(MainCard)`
  align-items: center;
  padding-top: calc(var(--theme-common-space) * 5);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 8);
  }

  max-width: 644px;
  align-self: center;
`

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

const initialState: UsdcTransFormState = {
  account: '',
  amount: '',
  token: usdcTokens.usdcXdaiOld,
  tokenOut: usdcTokens.usdceGnosis,
}

const Main = () => {
  const { address } = useWeb3Connection()
  const [formState, dispatch] = useReducer(
    (data: UsdcTransFormState, partial: Partial<UsdcTransFormState>): UsdcTransFormState => ({
      ...data,
      ...partial,
    }),
    {
      ...initialState,
      account: address || ZERO_ADDRESS,
    },
  )
  const [debouncedAmount] = useDebounce(formState.amount, 500)

  const amount = parseUnits(debouncedAmount || '0', formState.token?.decimals || 0)

  const handleTokenChange = async () => {
    const token =
      formState.token === usdcTokens.usdcXdaiOld ? usdcTokens.usdceGnosis : usdcTokens.usdcXdaiOld
    const tokenOut =
      formState.tokenOut === usdcTokens.usdcXdaiOld
        ? usdcTokens.usdceGnosis
        : usdcTokens.usdcXdaiOld

    dispatch({
      ...initialState,
      account: address || ZERO_ADDRESS,
      token,
      tokenOut,
    })
  }

  const clearForm = async () => {
    dispatch({ ...formState, amount: '' })
  }

  return (
    <Wrapper>
      <FormWrapper>
        <Header />
        <Form>
          <FormCards>
            <InnerCardFrom>
              <Title>From</Title>
              <OnChainInfo>
                {formState.token && <TokenInfo token={formState.token} />}
                <UserBalance
                  address={address}
                  onMax={(value) => dispatch({ ...formState, amount: value })}
                  token={formState.token}
                />
              </OnChainInfo>
              <BridgedToken>
                <AmountInput
                  decimals={formState.token?.decimals || 18}
                  disabled={false}
                  onChange={(value) => dispatch({ ...formState, amount: value })}
                  placeholder="0.00"
                  value={formState.amount}
                />
              </BridgedToken>
              <Switch onClick={() => handleTokenChange()} />
            </InnerCardFrom>
            <InnerCard>
              <Title>To</Title>
              <OnChainInfo>
                {formState.tokenOut && <TokenInfo token={formState.tokenOut} />}
                <UserBalance address={address} token={formState.tokenOut} />
              </OnChainInfo>
            </InnerCard>
            {amount > 0n && formState.token && formState.tokenOut && address && (
              <TransSummary
                amount={amount}
                token={formState.token}
                tokenOut={formState.tokenOut}
                userAddress={address}
              />
            )}
          </FormCards>
          {!formState.token || !address || amount === 0n ? (
            <DisabledTransButton />
          ) : (
            <SafeSuspense fallback={<ButtonPlaceholder />}>
              <TransButton
                amount={amount}
                clearForm={clearForm}
                fromToken={formState.token}
                userAddress={address}
              />
            </SafeSuspense>
          )}
        </Form>
      </FormWrapper>
    </Wrapper>
  )
}

export const UsdcTransmutationFormIndex: React.FC = () => (
  <SafeSuspense fallback={<SkeletonCommon />}>
    <Main />
  </SafeSuspense>
)
