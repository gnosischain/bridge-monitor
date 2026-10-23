import { useReducer } from 'react'
import styled from 'styled-components'
import { AmountTokenInput } from '@/src/pagePartials/bridge/bridgeForm/AmountTokenInput'
import { DisabledTransButton, TransButton } from './TransButton'
import { Header } from './Header'
import { InnerCard } from '@/src/pagePartials/bridge/bridgeForm/InnerCard'
import { Switch } from '@/src/pagePartials/bridge/bridgeForm/Switch'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useDebounce } from 'use-debounce'
import { UsdcTransFormState } from './types'
import { TokenInfo } from './TokenInfo'
import { UserBalance } from './UserBalance'
import { TransSummary } from './TransSummary'
import { Wrapper as FormCard } from '@/src/pagePartials/bridge/common/Wrapper'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'
import { usdcTokens } from '@/src/constants/usdcTokens'
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

const AmountRow = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  min-height: 44px;
`

// The swap is 1:1, so the "To" side shows the same amount.
const AmountOut = styled.span<{ $empty: boolean }>`
  color: ${({ $empty, theme: { colors } }) => ($empty ? colors.faint : colors.ink)};
  flex-grow: 1;
  font-size: 2.6rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 44px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;
  }
`

const PanelFooter = styled.div`
  align-items: center;
  display: flex;
  min-height: 20px;
`

export const Wrapper = styled(FormCard)`
  align-self: center;
  max-width: 600px;
`

const initialState: UsdcTransFormState = {
  account: '',
  amount: '',
  token: usdcTokens.usdcXdaiOld,
  tokenOut: usdcTokens.usdceGnosis,
}

export const UsdcTransmutationFormIndex: React.FC = () => {
  const { address } = useWeb3Connection()
  const [formState, dispatch] = useReducer(
    (data: UsdcTransFormState, partial: Partial<UsdcTransFormState>): UsdcTransFormState => ({
      ...data,
      ...partial,
    }),
    {
      ...initialState,
      account: address || zeroAddress,
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
      account: address || zeroAddress,
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
              <PanelLabel>From</PanelLabel>
              <AmountRow>
                <AmountTokenInput
                  decimals={formState.token?.decimals || 18}
                  disabled={false}
                  onChange={(value) => dispatch({ ...formState, amount: value })}
                  placeholder="0.00"
                  value={formState.amount}
                />
                {formState.token && <TokenInfo token={formState.token} />}
              </AmountRow>
              <PanelFooter>
                <UserBalance
                  address={address}
                  onMax={(value) => dispatch({ ...formState, amount: value })}
                  token={formState.token}
                />
              </PanelFooter>
              <Switch onClick={() => handleTokenChange()} />
            </InnerCardFrom>
            <InnerCard>
              <PanelLabel>To</PanelLabel>
              <AmountRow>
                <AmountOut $empty={!formState.amount}>{formState.amount || '0.00'}</AmountOut>
                {formState.tokenOut && <TokenInfo token={formState.tokenOut} />}
              </AmountRow>
              <PanelFooter>
                <UserBalance address={address} token={formState.tokenOut} />
              </PanelFooter>
            </InnerCard>
          </FormCards>
          {amount > 0n && formState.token && formState.tokenOut && address && (
            <TransSummary
              amount={amount}
              token={formState.token}
              tokenOut={formState.tokenOut}
              userAddress={address}
            />
          )}
          {!formState.token || !address || amount === 0n ? (
            <DisabledTransButton />
          ) : (
            <TransButton
              amount={amount}
              clearForm={clearForm}
              fromToken={formState.token}
              userAddress={address}
            />
          )}
        </Form>
      </FormWrapper>
    </Wrapper>
  )
}
