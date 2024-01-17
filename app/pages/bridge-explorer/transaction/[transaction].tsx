import type { NextPage } from 'next'
import {
  Transaction,
  TransactionSkeletonLoading,
} from '@/src/pagePartials/bridgeExplorer/transaction'
import { genericSuspense } from '@/src/components/safeSuspense'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import dynamic from 'next/dynamic'
import NextHead from 'next/head'

const TokenListProvider = dynamic(() => import('@/src/providers/tokenListProvider'), {
  ssr: false,
})

const TransactionPage: NextPage = genericSuspense(
  () => {
    const title = 'Transaction Details - Gnosis Bridge Explorer'
    const description =
      'Real-time details of bridging transactions plus integrated claiming functionality and of bridge transaction analytics.'

    return (
      <>
        <NextHead>
          <title>{title}</title>
          <meta content={description} name="description" />
          <meta content={title} property="og:title" />
          <meta content="website" property="og:type" />
          <meta content={description} property="og:description" />
          <meta content={title} name="twitter:site" />
        </NextHead>
        <ValidatorsProvider>
          <TokenListProvider>
            <Transaction />
          </TokenListProvider>
        </ValidatorsProvider>
      </>
    )
  },
  () => <TransactionSkeletonLoading />,
)

export default TransactionPage
