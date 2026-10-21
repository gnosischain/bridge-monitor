import Link from 'next/link'
import styled from 'styled-components'
import useBridgeProgress from '@/src/hooks/bridge/useBridgeProgress'
import { BlockConfirmations } from '@/src/pagePartials/common/BlockConfirmations'
import { ButtonFull } from '@/src/components/buttons/Button'
import { Chains, ChainsValues } from '@/src/constants/config/types'
import { GenericError } from '@/src/components/error/GenericError'
import { Failed } from '@/src/components/assets/Failed'
import { Ok } from '@/src/components/assets/Ok'
import { getChainKey, getNetworkConfig } from '@/src/constants/config/chains'
import { transactionBaseURL } from '@/src/constants/sections'
import { useFetchTransactions } from '@/src/hooks/useTransactions'
import { Transaction, TransactionStatus } from '@/src/utils/transactions'
import { useRouter } from 'next/router'
import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'
import { Wrapper } from '@/src/pagePartials/bridge/common/Wrapper'
import { formatNumber } from '@/src/utils/format'
import { formatUnits } from 'viem'
import { useTokenInfo } from '@/src/hooks/bridge/useTokenInfo'

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2.5);
  width: 100%;
`

const Message = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 1.5);
  justify-content: center;
  padding: calc(var(--theme-common-space) * 3) 0 calc(var(--theme-common-space) * 1);
  text-align: center;
`

const Icon = styled.div<{ $failed: boolean }>`
  --size: 64px;

  align-items: center;
  background-color: ${({ $failed, theme: { colors } }) =>
    $failed ? colors.errorSoft : colors.successSoft};
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.success};
  display: flex;
  height: var(--size);
  justify-content: center;
  margin-bottom: var(--theme-common-space);
  width: var(--size);
`

const StatusTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 3rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.06;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 3.6rem;
  }
`

const MessageText = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  max-width: 440px;
`

const BottomInfo = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  text-align: center;
`

export const Loading: React.FC = () => (
  <InnerWrapper>
    <Message>
      <SkeletonLoading
        style={{ borderRadius: '50%', height: '64px', minWidth: '0', width: '64px' }}
      />
      <SkeletonLoading style={{ borderRadius: '12px', height: '36px', maxWidth: '260px' }} />
      <SkeletonLoading style={{ borderRadius: '999px', height: '16px', maxWidth: '320px' }} />
    </Message>
    <SkeletonLoading style={{ borderRadius: '16px', height: '190px' }} />
    <ButtonFull disabled>Loading...</ButtonFull>
  </InnerWrapper>
)

// The indexer only moves a transfer past COLLECTING once the validators' signatures reach the
// threshold: UNCLAIMED towards Ethereum (the user still has to claim), COMPLETED towards Gnosis
// (the affirmation executes with the last required signature).
const SIGNED_STATUSES = [TransactionStatus.Unclaimed, TransactionStatus.Completed]

const hasCollectedSignatures = (tx: Transaction | null): boolean =>
  !!tx && SIGNED_STATUSES.includes(tx.transactionStatus)

// ERROR is final: the message's execution on the destination chain failed.
const hasFailed = (tx: Transaction | null): boolean =>
  tx?.transactionStatus === TransactionStatus.Error

const isSettled = (tx: Transaction | null): boolean => hasCollectedSignatures(tx) || hasFailed(tx)

const ButtonExploreTransaction = ({
  isLoading,
  tx,
}: {
  isLoading: boolean
  tx: Transaction | null
}) => {
  const router = useRouter()
  const isWaitingForIndexing = !tx || isLoading

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

  const [transactionHash, fromChainId, toChainId, tokenAddress, amount, isSubmitted] = [
    String(router.query?.transaction),
    Number(router.query?.fromChainId) as ChainsValues,
    Number(router.query?.toChainId) as ChainsValues,
    String(router.query?.tokenAddress),
    String(router.query?.amount),
    // set when arriving straight from a broadcast: the hash is known-valid, so never claim
    // "not found" for it while the RPC catches up
    Boolean(Number(router.query?.submitted)),
  ]

  const { data: tokenBridged } = useTokenInfo(tokenAddress, fromChainId)

  const initiatorChain = getChainKey(fromChainId)
  const destinationChain = getNetworkConfig(toChainId).name

  const { isError, isNotFound, progressData } = useBridgeProgress(
    fromChainId,
    transactionHash,
    isSubmitted,
  )

  const formattedAmount = Number(formatUnits(BigInt(amount), tokenBridged?.decimals ?? 18))

  const { isLoading: isLoadingTx, transactions } = useFetchTransactions(
    { where: { transactionHash: { _eq: transactionHash.toLowerCase() } } },
    { pollUntil: (txs) => isSettled(txs[0] ?? null) },
  )
  const tx = transactions[0] ?? null

  const isConfirmed = progressData?.progress === 100
  const isBridgeComplete = hasCollectedSignatures(tx)
  const isBridgeFailed = hasFailed(tx)

  return (
    <Wrapper {...restProps}>
      {isNotFound ? (
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
      ) : isError || !progressData ? (
        <GenericError
          text={
            <>
              We couldn't reach the network to load this transaction's status. This is usually
              temporary — it will keep retrying automatically.
              <br />
              <br />
              If it persists, refresh the page or go back to <Link href="/">the homepage</Link>.
            </>
          }
          title="Connection Problem"
        />
      ) : (
        <InnerWrapper>
          <Message>
            <Icon $failed={isBridgeFailed}>{isBridgeFailed ? <Failed /> : <Ok />}</Icon>
            <StatusTitle>
              Bridge {isBridgeFailed ? 'failed' : isBridgeComplete ? 'completed' : 'initiated'}
            </StatusTitle>
            <MessageText>
              {isBridgeFailed ? (
                <>
                  Sending {formatNumber(formattedAmount)} {tokenBridged?.symbol} to{' '}
                  {destinationChain} failed: the transfer could not be executed on{' '}
                  {destinationChain}. Open the transaction for details.
                </>
              ) : (
                <>
                  {!isBridgeComplete && (
                    <>
                      {!progressData?.isMined
                        ? 'Waiting for transaction to be mined.'
                        : !isConfirmed
                          ? 'Waiting for confirmation.'
                          : 'Waiting for validator signatures.'}
                      <br />
                    </>
                  )}
                  {isBridgeComplete ? 'Sent' : 'Sending'} {formatNumber(formattedAmount)}{' '}
                  {tokenBridged?.symbol} to {destinationChain}.
                </>
              )}
            </MessageText>
          </Message>
          <BlockConfirmations network={initiatorChain} transactionHash={transactionHash} />
          <ButtonExploreTransaction isLoading={isLoadingTx} tx={tx} />
          {isBridgeComplete && toChainId === Chains.mainnet && (
            <BottomInfo>Claim to unlock your tokens</BottomInfo>
          )}
        </InnerWrapper>
      )}
    </Wrapper>
  )
}
