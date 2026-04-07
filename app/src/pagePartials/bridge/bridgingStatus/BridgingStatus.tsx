import Link from 'next/link'
import styled from 'styled-components'
import useBridgeProgress from '@/src/hooks/bridge/useBridgeProgress'
import { BlockConfirmations } from '@/src/pagePartials/common/BlockConfirmations'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { GenericError } from '@/src/components/error/GenericError'
import { MainTitle } from '@/src/components/text/MainTitle'
import { Ok } from '@/src/components/assets/Ok'
import { getChainKey, getNetworkConfig } from '@/src/constants/config/chains'
import { transactionBaseURL } from '@/src/constants/sections'
import { useEffect } from 'react'
import { useFetchTransactions } from '@/src/hooks/useTransactions'
import { useRouter } from 'next/router'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Wrapper } from '@/src/pagePartials/bridge/common/Wrapper'
import { formatNumber } from '@/src/utils/format'
import { useTokenInfo } from '@/src/hooks/bridge/useTokenInfo'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { formatUnits } from 'viem'

const InnerWrapper = styled.div`
  max-width: 644px;
  width: 100%;
`

const Header = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGreen};
  border-radius: 16px 16px 0 0;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  justify-content: space-between;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: var(--theme-common-space);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
  }
`

const Contents = styled.div`
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 1);
  position: relative;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 3);
  }
`

const Inner = styled.div`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
  padding: calc(var(--theme-common-space) * 3);
`

const Message = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
  justify-content: center;
  padding: calc(var(--theme-common-space) * 6) 0 calc(var(--theme-common-space) * 4);
`

const Icon = styled.div`
  --size: 80px;

  align-items: center;
  border-radius: 50%;
  border: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  display: flex;
  height: var(--size);
  justify-content: center;
  width: var(--size);
`

const StatusTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 100%;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 2.8rem;
  }
`

const MessageText = styled.p`
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  max-width: 418px;
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.8rem;
  }
`

const BottomInfo = styled.p`
  font-size: 1.4rem;
  font-weight: 300;
  line-height: 1.2;
  margin: 0;
  text-align: center;
`

const WarningInfo = styled(BottomInfo)`
  color: rgb(221, 113, 67);
  a {
    color: inherit;
  }
`

export const Loading: React.FC = () => (
  <>
    <SkeletonLoading
      style={{
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '786px',
        padding: '96px 24px 24px 24px',
        rowGap: '16px',
        maxWidth: '644px',
        width: '100%',
      }}
    >
      <SkeletonLoading
        $animate={false}
        style={{
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          height: '666px',
          padding: '290px 24px 24px 24px',
          rowGap: '16px',
        }}
      >
        <SkeletonLoading
          style={{
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            height: '263px',
          }}
        />
        <ButtonFull disabled>Loading...</ButtonFull>
      </SkeletonLoading>
    </SkeletonLoading>
  </>
)

const ButtonExploreTransaction = ({
  isMined,
  transactionHash,
}: {
  isMined: boolean
  transactionHash: string
}) => {
  const router = useRouter()
  const { isLoading, transactions, updateInMemoryTransaction } = useFetchTransactions(
    {},
    {
      where: { transactionHash: { _eq: transactionHash.toLowerCase() } },
    },
  )

  const tx = transactions.length ? transactions[0] : null
  const isWaitingForIndexing = !tx || isLoading

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (!transactions.length) {
      intervalId = setInterval(() => {
        updateInMemoryTransaction()
      }, 5000) // Call updateInMemoryTransaction every 5 seconds if the transaction is not found
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId) // Clear the interval when the component unmounts or the dependencies change
      }
    }
  }, [isMined, transactions, updateInMemoryTransaction])

  return (
    <ButtonFull
      disabled={!tx || isLoading}
      onClick={() => router.push(`${transactionBaseURL}/${tx?.id}`)}
    >
      {isWaitingForIndexing ? 'Loading transaction link...' : 'Explore transaction'}
    </ButtonFull>
  )
}

export const BridgingStatus: React.FC = ({ ...restProps }) => {
  const router = useRouter()

  const [transactionHash, fromChainId, toChainId, isNativeBridge, tokenAddress, amount] = [
    String(router.query?.transaction),
    Number(router.query?.fromChainId) as ChainsValues,
    Number(router.query?.toChainId) as ChainsValues,
    Boolean(Number(router.query?.isNativeBridge)),
    String(router.query?.tokenAddress),
    String(router.query?.amount),
  ]

  const { data: tokenBridged } = useTokenInfo(tokenAddress, fromChainId)

  const initiatorChain = getChainKey(fromChainId)
  const destinationChain = getNetworkConfig(toChainId).name

  const { isLoading, progressData } = useBridgeProgress(
    fromChainId,
    isNativeBridge,
    transactionHash,
  )

  const formattedAmount = Number(formatUnits(BigInt(amount), tokenBridged?.decimals || 18))

  const isBridgeComplete = progressData?.progress === 100

  const { address, isSCWallet } = useWeb3Connection()

  const myTxsLink = `/bridge-explorer/my-transactions?hash=${address}`

  return (
    <Wrapper {...restProps}>
      {isLoading ? (
        <Loading />
      ) : !progressData ? (
        <GenericError
          text={
            <>
              Sorry, but the transaction you're looking for doesn't seem to exist. Maybe there's an
              error in the transaction's hash, or the system is still processing it.
              <br />
              <br />
              Please double-check the URL for any typos or try searching the transaction again from{' '}
              <Link href="/">the homepage</Link>.
            </>
          }
          title="Transaction Not Found"
        />
      ) : (
        <InnerWrapper>
          <Header>
            <MainTitle>Bridge</MainTitle>
          </Header>
          <Contents>
            <Inner>
              <Message>
                <Icon>
                  <Ok />
                </Icon>
                <StatusTitle>Bridge {isBridgeComplete ? 'completed' : 'initiated'}</StatusTitle>
                <MessageText>
                  {!isBridgeComplete && (
                    <>
                      {progressData?.isMined
                        ? 'Waiting for confirmation.'
                        : 'Waiting for transaction to be mined.'}
                      <br />
                    </>
                  )}
                  {isBridgeComplete ? 'Sent' : 'Sending'} {formatNumber(formattedAmount)}{' '}
                  {tokenBridged?.symbol} to {destinationChain}.
                </MessageText>
              </Message>
              <BlockConfirmations
                isNativeBridge={isNativeBridge}
                network={initiatorChain}
                transactionHash={transactionHash}
              />
              <ButtonExploreTransaction
                isMined={progressData.isMined || false}
                transactionHash={transactionHash}
              />
              {isSCWallet && (
                <WarningInfo>
                  When using a smart contract wallet, if transaction is executed but transaction
                  link is not loaded, go to <a href={myTxsLink}>My Transactions</a> page.
                </WarningInfo>
              )}
              {isBridgeComplete && toChainId === Chains.mainnet && (
                <BottomInfo>Claim to unlock your tokens</BottomInfo>
              )}
            </Inner>
          </Contents>
        </InnerWrapper>
      )}
    </Wrapper>
  )
}
