import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { Textfield } from '@/src/components/form/Textfield'
import { ChangeEventHandler } from 'react'
import { AlertMessage } from '@/src/components/error/AlertMessage'
import { useEffect, useState } from 'react'
import { SendToDifferentWallet } from '@/src/pagePartials/bridge/bridgeForm/SendToDifferentWallet'
import { genericSuspense } from '@/src/components/safeSuspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Eyebrow } from '@/src/components/text/Eyebrow'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--theme-common-space);
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
  width: 100%;
`

const Warning = styled(AlertMessage)`
  .text {
    color: ${({ theme: { colors } }) => colors.ink};
  }
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
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined
  recipient: string
}> = genericSuspense(
  ({ onChange, recipient }) => {
    const [isLoading, setIsLoading] = useState(true)
    const { isSCWallet } = useWeb3Connection()

    const [isDifferentWalletOpen, setIsDifferentWalletOpen] = useState(isSCWallet || false)

    useEffect(() => {
      if (isSCWallet) {
        setIsDifferentWalletOpen(true)
      }
    }, [isSCWallet])

    const animation = isSCWallet
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

    useEffect(() => {
      // hack, couldn't trigger suspense above
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)

      return () => clearTimeout(timer)
    }, [])

    return (
      <Wrapper>
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            {isSCWallet ? (
              <Warning
                mode="warning"
                text={
                  'A recipient address is required when using a smart contract wallet. Be sure you control the recipient address on the destination chain.'
                }
              />
            ) : (
              <SendToDifferentWallet
                isOpen={isDifferentWalletOpen}
                onClick={() =>
                  setIsDifferentWalletOpen((isDifferentWalletOpen) => !isDifferentWalletOpen)
                }
              />
            )}
            <AnimatePresence initial={false}>
              {isDifferentWalletOpen && (
                <RecipientAddressWrapper key="recipientAddress" {...animation}>
                  <RecipientAddressHeader as="label" htmlFor="recipientAddress">
                    Recipient address
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
  },
  () => <Skeleton />,
)
