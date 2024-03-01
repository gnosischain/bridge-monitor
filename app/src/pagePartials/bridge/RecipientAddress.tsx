import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { Textfield } from '@/src/components/form/Textfield'
import { ChangeEventHandler } from 'react'
import { AlertMessage } from '@/src/components/error/AlertMessage'
import { useEffect, useState } from 'react'
import { SendToDifferentWallet } from '@/src/pagePartials/bridge/SendToDifferentWallet'
import { genericSuspense } from '@/src/components/safeSuspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import useSWR from 'swr'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

const Wrapper = styled(motion.div)`
  align-items: flex-start;
  border-radius: var(--theme-common-space);
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.borderRadiusBig};
  padding: calc(var(--theme-common-space) * 2) var(--theme-common-space);

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2);
  }
`

const RecipientAddressHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  width: 100%;
`

const Warning = styled(AlertMessage)`
  background-color: ${({ theme: { colors } }) => colors.white};
  margin-bottom: calc(var(--theme-common-space) * -1);
  margin-top: calc(var(--theme-common-space) * -1);
  padding: calc(var(--theme-common-space) + var(--theme-common-space) / 2);

  .text {
    color: ${({ theme: { colors } }) => colors.textColor};
    font-size: 1.4rem;
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
    <SkeletonLoading style={{ height: '30px', borderRadius: '4px' }} />
  </SkeletonWrapper>
)

export const RecipientAddress: React.FC<{
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined
  recipient: string
}> = genericSuspense(
  ({ onChange, recipient }) => {
    const [isLoading, setIsLoading] = useState(true)
    const { address, readOnlyAppProvider } = useWeb3Connection()
    const isSCWallet = useSWR(
      address && readOnlyAppProvider
        ? [`isSCWallet-${address}`, address, readOnlyAppProvider]
        : null,
      ([, address, provider]) => provider.getCode(address).then((code) => code !== '0x'),
      {
        suspense: true,
      },
    ).data

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

    // hack, couldn't trigger suspense above
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return isLoading ? (
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
            <Wrapper key="recipientAddress" {...animation}>
              <RecipientAddressHeader>Recipient Address</RecipientAddressHeader>
              <Textfield onChange={onChange} type="text" value={recipient} />
            </Wrapper>
          )}
        </AnimatePresence>
      </>
    )
  },
  () => <Skeleton />,
)
