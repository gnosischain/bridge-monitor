import type { NextPage } from 'next'
import {
  Transaction,
  TransactionSkeletonLoading,
} from '@/src/pagePartials/bridgeExplorer/transaction'
import SafeSuspense from '@/src/components/safeSuspense'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import NextHead from 'next/head'
import TokenListProvider from '@/src/providers/tokenListProvider'

const Main = () => {
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
      <TokenListProvider>
        <ValidatorsProvider>
          <Transaction />
        </ValidatorsProvider>
      </TokenListProvider>
    </>
  )
}

const TransactionPage: NextPage = () => (
  <SafeSuspense fallback={<TransactionSkeletonLoading />}>
    <Main />
  </SafeSuspense>
)

export default TransactionPage
