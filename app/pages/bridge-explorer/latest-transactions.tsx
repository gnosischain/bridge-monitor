import type { NextPage } from 'next'
import NextHead from 'next/head'
import { LatestTransactions } from '@/src/pagePartials/bridgeExplorer/latestTransactions'
// import { Token } from 'graphql'
import TokenListProvider from '@/src/providers/tokenListProvider'

const LatestTransactionsPage: NextPage = () => {
  const title = 'Latest Transactions - Gnosis Bridge Explorer'
  const description =
    'Real-time tracking of xDAI and OmniBridge bridging transactions at your fingertips with integrated claiming functionality.'

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
        <LatestTransactions />
      </TokenListProvider>
    </>
  )
}
export default LatestTransactionsPage
