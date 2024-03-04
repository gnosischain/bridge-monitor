import styled from 'styled-components'
import { MainTitle } from '@/src/components/text/MainTitle'
import Link from 'next/link'
import { Ok } from '@/src/components/assets/Ok'
import { ButtonFull } from '@/src/components/buttons/Button'
import { BlockConfirmations } from '@/src/pagePartials/common/BlockConfirmations'
import { transactionBaseURL } from '@/src/constants/sections'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useBridgedTokens } from '@/src/providers/tokenListProvider'
import { getNetworkConfig } from '@/src/constants/config/chains'
import { Chains, ChainsKeys, ChainsValues } from '@/src/constants/config/types'
import useBridgeProgress from '@/src/hooks/bridge/useBridgeProgress'
import nullthrows from 'nullthrows'
import { Loading } from '@/src/components/loading'
import { GenericError } from '@/src/components/error/GenericError'
import { useFetchTransactions } from '@/src/hooks/subgraph/useTransactions'

const Wrapper = styled.div`
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

const GoBack = styled.span`
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;

  &:active {
    opacity: 0.7;
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

// function to get ChainKey from chainId
const getChainKey = (chainId: number) => {
  const key = Object.keys(Chains).find((key) => Chains[key as keyof typeof Chains] === chainId)
  return nullthrows(key, 'Chain not found') as ChainsKeys
}

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
      where: { transactionHash },
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

export const Success: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const { tokensByAddress } = useBridgedTokens()

  const [transactionHash, fromChainId, toChainId, isNativeBridge, tokenAddress, amount] = [
    String(router.query?.transaction),
    Number(router.query?.fromChainId) as ChainsValues,
    Number(router.query?.toChainId) as ChainsValues,
    Boolean(Number(router.query?.isNativeBridge)),
    String(router.query?.tokenAddress),
    String(router.query?.amount),
  ]

  const tokenBridged = tokensByAddress[tokenAddress]
  const initiatorChain = getChainKey(fromChainId)
  const destinationChain = getNetworkConfig(toChainId).name

  const { isLoading, progressData } = useBridgeProgress(
    fromChainId,
    isNativeBridge,
    transactionHash,
  )

  if (isLoading) {
    return <Loading text="Loading transaction" />
  }

  if (!progressData) {
    return (
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
    )
  }

  const isBridgeComplete = progressData.progress === 100

  return (
    <Wrapper {...restProps}>
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
              {isBridgeComplete ? 'Sent' : 'Sending'} {amount} {tokenBridged.symbol} to{' '}
              {destinationChain}.
            </MessageText>
          </Message>
          {!isBridgeComplete && (
            <BlockConfirmations
              isNativeBridge={isNativeBridge}
              network={initiatorChain}
              transactionHash={transactionHash}
            />
          )}
          <ButtonExploreTransaction
            isMined={progressData.isMined || false}
            transactionHash={transactionHash}
          />
        </Inner>
      </Contents>
    </Wrapper>
  )
}
