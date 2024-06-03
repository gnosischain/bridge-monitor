import type { NextPage } from 'next'
import NextHead from 'next/head'
import { UsdcTransmutationFormIndex } from '@/src/pagePartials/usdc'

const TermsPage: NextPage = () => {
  const title = 'USDC swap'
  const description = 'USDC swap'

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
      <UsdcTransmutationFormIndex />
    </>
  )
}

export default TermsPage
