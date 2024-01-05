import type { NextPage } from 'next'
import { Bridges } from '@/src/pagePartials/bridgeExplorer/bridges'
import NextHead from 'next/head'

const BridgesPage: NextPage = () => {
  const title = 'Bridges - Gnosis Bridge Explorer'
  const description = 'Bridge information on all Gnosis Chain bridges.'

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
      <Bridges />
    </>
  )
}
export default BridgesPage
