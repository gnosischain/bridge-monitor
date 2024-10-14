import type { NextPage } from 'next'
import { Search } from '@/src/pagePartials/bridgeExplorer/search'
import NextHead from 'next/head'
// import { Token } from 'graphql'
import TokenListProvider from '@/src/providers/tokenListProvider'

const MyTransactionsPage: NextPage = () => {
  const title = 'My Transactions - Gnosis Bridge Explorer'
  const description =
    'Real-time tracking of your xDAI and OmniBridge bridging transactions with integrated claiming functionality.'

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
        <Search />
      </TokenListProvider>
    </>
  )
}
export default MyTransactionsPage
