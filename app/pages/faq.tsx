import NextHead from 'next/head'
import type { NextPageWithLayout } from '@/pages/_app'
import { Questions } from '@/src/components/faq/Questions'
import { FAQContents } from '@/src/components/faq/FAQContents'
import { ReactElement } from 'react'
import { SidebarLayout } from '@/src/components/sidebarLayout'

const FAQPage: NextPageWithLayout = () => {
  const title = 'Frequently Asked Questions - Gnosis Bridge Explorer'
  const description = 'Frequently asked questions for the Gnosis Bridge Explorer.'

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
      <FAQContents />
    </>
  )
}

FAQPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <SidebarLayout
      sidebarContents={
        <>
          <Questions />
        </>
      }
      sidebarPlacement="right"
    >
      {page}
    </SidebarLayout>
  )
}

export default FAQPage
