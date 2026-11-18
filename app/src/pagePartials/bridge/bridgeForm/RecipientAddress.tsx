import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { Textfield } from '@/src/components/form/Textfield'
import { ChangeEventHandler } from 'react'
import { useEffect, useState } from 'react'
import { SendToDifferentWallet } from '@/src/pagePartials/bridge/bridgeForm/SendToDifferentWallet'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Eyebrow } from '@/src/components/text/Eyebrow'
import { Tooltip } from '@/src/components/tooltip'
import { IconCheck } from '@/src/components/assets/IconCheck'
import { useSameSafe } from '@/src/hooks/bridge/useSameSafe'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { ChainsValues } from '@/src/constants/config/types'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--theme-common-space);
`

const ToggleRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-common-space);
`

const SameSafe = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.fog};
  display: flex;
  font-size: 1.3rem;
  gap: 6px;
`

const RecipientAddressWrapper = styled(motion.div)`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: var(--theme-common-space);
  overflow: hidden;

  input {
    background-color: ${({ theme: { colors } }) => colors.surface};
    border-color: ${({ theme: { colors } }) => colors.line};
    height: 48px;
  }
`

const RecipientAddressHeader = styled(Eyebrow)`
  align-items: center;
  column-gap: 6px;
  display: flex;
  width: 100%;
`

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--theme-common-space);
  width: 100%;
`

const Skeleton = () => (
  <SkeletonWrapper>
    <SkeletonLoading style={{ height: '24px', borderRadius: '999px' }} />
  </SkeletonWrapper>
)

export const RecipientAddress: React.FC<{
  fromChainId: ChainsValues
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined
  recipient: string
  toChainId: ChainsValues
}> = ({ fromChainId, onChange, recipient, toChainId }) => {
  const walletSafe = useSameSafe(fromChainId, toChainId)
  const isRequired = walletSafe === 'notSameSafe'
  const toChainName = getNetworkConfig(toChainId).name

  const [isDifferentWalletOpen, setIsDifferentWalletOpen] = useState(isRequired)

  useEffect(() => {
    if (isRequired) {
      setIsDifferentWalletOpen(true)
    }
  }, [isRequired])

  const animation = isRequired
    ? {}
    : {
        animate: { height: 'auto', y: 0, opacity: 1 },
        exit: { height: 0, y: '-10%', opacity: 0 },
        initial: { height: 0, y: '-10%', opacity: 0 },
        transition: {
          type: 'tween',
          duration: 0.15,
          ease: 'easeInOut',
        },
      }

  return (
    <Wrapper>
      {walletSafe === 'loading' ? (
        <Skeleton />
      ) : (
        <>
          {!isRequired && (
            <ToggleRow>
              {walletSafe === 'sameSafe' && !recipient && (
                <SameSafe>
                  <IconCheck /> Same Safe on {toChainName}
                </SameSafe>
              )}
              <SendToDifferentWallet
                isOpen={isDifferentWalletOpen}
                onClick={() =>
                  setIsDifferentWalletOpen((isDifferentWalletOpen) => !isDifferentWalletOpen)
                }
              />
            </ToggleRow>
          )}
          <AnimatePresence initial={false}>
            {isDifferentWalletOpen && (
              <RecipientAddressWrapper key="recipientAddress" {...animation}>
                <RecipientAddressHeader as="label" htmlFor="recipientAddress">
                  Recipient address
                  {isRequired && (
                    <Tooltip
                      content={`Your wallet isn't the same Safe on ${toChainName}. Enter an address you control there.`}
                    />
                  )}
                </RecipientAddressHeader>
                <Textfield
                  id="recipientAddress"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={onChange as any}
                  type="text"
                  value={recipient}
                />
              </RecipientAddressWrapper>
            )}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  )
}
