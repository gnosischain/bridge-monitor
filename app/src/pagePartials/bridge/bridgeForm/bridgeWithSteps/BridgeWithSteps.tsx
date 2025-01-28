import { Modal } from '@/src/components/modal'
import { StatusDetails } from './StatusDetails'
// import { TransactionStatus } from '@/types/generated/subgraph'
import styled from 'styled-components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Status } from '@/src/pagePartials/bridgeExplorer/transaction/IconStatus'
import useTransaction from '@/src/hooks/useTransaction'
import { Chains } from '@/src/constants/config/chains'
import { TRANSMUTER_ADDRESS, USDCe_GNOSIS, ZERO_ADDRESS } from '@/src/constants/misc'
import { useUserTokenBalances } from '@/src/hooks/bridge/useUserTokenBalances'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { BigNumber } from 'ethers'
import { useApproval } from '@/src/hooks/bridge/useApproval'
import { useTransmuterTxInfo } from '@/src/hooks/usdcTransmuter/useTransmuterTxInfo'
import { TokenUsdc } from '@/src/pagePartials/usdc/types'

const StatusList = styled.div`
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2)
    calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    padding: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 4);
  }
`

const consensusAchieved = true

type Step = 'notStarted' | 'now' | 'done'
type Steps = {
  approving: Step[]
  swapping: Step[]
  bridging: Step[]
  completed: Step[]
}

const statuses = {
  approve: {
    notStarted: {
      title: '',
      text: '',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm approval transaction in your wallet',
      text: 'Waiting for approval transaction confirmation...',
      statusIcon: 'waiting',
    },
    done: {
      title: 'Approval confirmed',
      text: 'Approval transaction is sent',
      statusIcon: 'success',
    },
  },
  swap: {
    notStarted: {
      title: 'Swapping',
      text: 'Not started',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm swap transaction in your wallet',
      text: 'Waiting for swap transaction confirmation...',
      statusIcon: 'waiting',
    },
    done: {
      title: 'Swap is executed',
      text: 'Swap transaction is sent',
      statusIcon: 'success',
    },
  },
  bridge: {
    notStarted: {
      title: 'Bridging',
      text: 'Not started',
      statusIcon: 'none',
    },
    now: {
      title: 'Confirm bridging transaction in your wallet',
      text: 'Waiting for bridging transaction confirmation...',
      statusIcon: 'waiting',
    },
    done: {
      title: 'Bridging is initiated',
      text: 'Bridging transaction is sent',
      statusIcon: 'success',
    },
  },
}

const steps: Steps = {
  approving: ['now', 'notStarted', 'notStarted'],
  swapping: ['done', 'now', 'notStarted'],
  bridging: ['done', 'done', 'now'],
  completed: ['done', 'done', 'done'],
}

export const BridgeWithSteps: React.FC<{ onClose: () => void; amount: BigNumber }> = ({
  amount,
  onClose,
  ...restProps
}) => {
  const [status, setStatus] = useState<Step[]>(steps.approving)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const shouldRun = useRef(false) // Ref to track execution
  const [approved, setApproved] = useState<boolean>(false)

  const { address } = useWeb3Connection()

  const { data: userBalanceData, mutate: refreshBalanceToken } = useUserTokenBalances({
    userAddress: address || ZERO_ADDRESS,
    chainId: Chains.gnosis,
    allowanceAddress: TRANSMUTER_ADDRESS,
    tokenAddress: USDCe_GNOSIS,
  })

  if (!userBalanceData) throw new Error('User balance data is not available')

  const isValidToSend = amount.gt(0) && amount.lte(userBalanceData.balance)
  const shouldApprove = amount.gt(userBalanceData.allowance) && amount.lte(userBalanceData.balance)

  console.log('approved', approved)
  console.log('shouldApprove', shouldApprove)
  console.log('returnZero', !(approved || !shouldApprove))

  const sendTx = useTransaction()
  const approve = useApproval()
  const swapTxData = useTransmuterTxInfo({
    amount,
    token: { address: USDCe_GNOSIS } as TokenUsdc,
    userAddress: address || ZERO_ADDRESS,
    returnZero: !(approved || !shouldApprove),
  })

  const approveTokens = useCallback(async () => {
    try {
      const tx = await approve({
        amount,
        spenderAddress: TRANSMUTER_ADDRESS,
        tokenAddress: USDCe_GNOSIS,
      })

      if (tx) {
        await tx.wait()
        await refreshBalanceToken()
        setApproved(true)
        // await refreshBalanceTokenOut()
      }
    } catch (error) {
      console.error(error)
    }

    // if (isComponentMounted) {
    //   setIsSending(false)
    // }
  }, [amount, approve, refreshBalanceToken])

  const swapTokens = useCallback(async () => {
    if (!swapTxData || !swapTxData.tx) return

    try {
      const tx = await sendTx(swapTxData.tx)
      if (tx) {
        await tx.wait()
      } else {
        throw new Error('Failed to swap')
      }
    } catch (error) {
      console.error(error)
    } finally {
      // if (isComponentMounted) {
      //   setIsSending(false)
      // }
    }
  }, [sendTx, swapTxData])

  useEffect(() => {
    if (shouldRun.current) {
      return
    }
    shouldRun.current = true

    const executeBridgeProcess = async () => {
      try {
        setIsProcessing(true)

        // Approve Step
        if (shouldApprove && !approved) {
          // setStatus(steps.approving)
          await approveTokens()
        }

        // Swap Step
        setStatus(steps.swapping)
        await swapTokens()

        // Bridge Step
        setStatus(steps.bridging)
        // await bridgeTokens()
        setStatus(steps.completed)

        // Optionally, notify the user of completion
      } catch (error) {
        console.error('Error during bridge process:', error)
        // Handle error (e.g., update status to show error, notify user)
      } finally {
        setIsProcessing(false)
      }
    }
    executeBridgeProcess()
  }, [approveTokens, shouldApprove, swapTokens, approved])

  return (
    <Modal onClose={onClose} size="lg" title="Bridge USDC.e to Ethereum" {...restProps}>
      <StatusList>
        <StatusDetails
          description="Grant permission to spend tokens"
          statusIcon={statuses.approve[status[0]].statusIcon as Status}
          title={statuses.approve[status[0]].title}
          transactionStatus="Approve"
        >
          <div>{statuses.approve[status[0]].text}</div>
        </StatusDetails>

        <StatusDetails
          description="Swap USDC.e to USDC"
          statusIcon={statuses.swap[status[1]].statusIcon as Status}
          title={statuses.swap[status[1]].title}
          transactionStatus="Swap"
        >
          <div>{statuses.swap[status[1]].text}</div>
        </StatusDetails>

        <StatusDetails
          description="Bridge USDC to Ethereum"
          statusIcon={statuses.bridge[status[2]].statusIcon as Status}
          title={statuses.bridge[status[2]].title}
          transactionStatus="Bridge"
        >
          <div>{statuses.bridge[status[2]].text}</div>
        </StatusDetails>
      </StatusList>
    </Modal>
  )
}
