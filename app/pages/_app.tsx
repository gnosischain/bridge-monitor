import type { NextPage } from 'next'
import type { AppContext, AppProps } from 'next/app'
import NextApp from 'next/app'
import dynamic from 'next/dynamic'
import { ReactElement, ReactNode } from 'react'

import { AbstractIntlMessages, NextIntlProvider } from 'next-intl'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { SWRConfig } from 'swr'

import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { Layout } from '@/src/components/layout'
import { Footer } from '@/src/components/layout/Footer'
import { Header } from '@/src/components/layout/Header'
import Toast from '@/src/components/toast/Toast'
import { Head } from '@/src/page_partials/index/Head'
import { TransactionNotificationProvider } from '@/src/providers/TransactionNotificationProvider'
import GeneralContextProvider from '@/src/providers/generalProvider'
import ThemeProvider from '@/src/providers/themeProvider'
import { intlErrorHandler } from '@/src/utils/intlErrorHandler'
import 'sanitize.css'

const Web3ConnectionProvider = dynamic(() => import('@/src/providers/web3ConnectionProvider'), {
  ssr: false,
})

const TokenIconsContextProvider = dynamic(() => import('@/src/providers/tokenIconsProvider'), {
  ssr: false,
})

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
  messages?: AbstractIntlMessages
}

export default function App({ Component, messages, pageProps }: AppPropsWithLayout) {
  // Black magic explained here https://nextjs.org/docs/basic-features/layouts
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>)

  return (
    <>
      <GoogleAnalytics />
      <NextIntlProvider messages={messages} onError={intlErrorHandler}>
        <Head />
        <SWRConfig
          value={{
            suspense: true,
            revalidateOnFocus: false,
          }}
        >
          <Web3ConnectionProvider>
            <ThemeProvider>
              <SafeSuspense>
                <TransactionNotificationProvider>
                  <GeneralContextProvider>
                    <TokenIconsContextProvider>
                      <Header />
                      {getLayout(<Component {...pageProps} />)}
                      <Footer />
                    </TokenIconsContextProvider>
                  </GeneralContextProvider>
                </TransactionNotificationProvider>
              </SafeSuspense>
              <Toast />
            </ThemeProvider>
          </Web3ConnectionProvider>
        </SWRConfig>
      </NextIntlProvider>
    </>
  )
}

App.getInitialProps = async function getInitialProps(context: AppContext) {
  const { locale } = context.router

  return {
    ...(await NextApp.getInitialProps(context)),
    messages: locale ? (await import(`@/messages/${locale}.json`)).default : undefined,
  }
}
