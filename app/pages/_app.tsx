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
import { Header } from '@/src/components/header'
import Toast from '@/src/components/toast/Toast'
import { Head } from '@/src/pagePartials/index/Head'
import { TransactionNotificationProvider } from '@/src/providers/TransactionNotificationProvider'
import ThemeProvider from '@/src/providers/themeProvider'
import { intlErrorHandler } from '@/src/utils/intlErrorHandler'
import TooltipConfig from '@/src/components/tooltip/TooltipConfig'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'

import 'sanitize.css'
import 'react-tooltip/dist/react-tooltip.css'
import 'react-datepicker/dist/react-datepicker.css'

const Web3ConnectionProvider = dynamic(() => import('@/src/providers/web3ConnectionProvider'), {
  ssr: false,
})

const TokenListProvider = dynamic(() => import('@/src/providers/TokenListProvider'), {
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
                  <TokenListProvider>
                    <Header />
                    <ValidatorsProvider>
                      {getLayout(<Component {...pageProps} />)}
                    </ValidatorsProvider>
                    <Footer />
                    <Toast />
                    <TooltipConfig />
                  </TokenListProvider>
                </TransactionNotificationProvider>
              </SafeSuspense>
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
