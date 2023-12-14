import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { ReactElement, ReactNode, useEffect } from 'react'
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
import TooltipConfig from '@/src/components/tooltip/TooltipConfig'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import { useRef } from 'react'

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
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Black magic explained here https://nextjs.org/docs/basic-features/layouts
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>)
  const router = useRouter()

  const scrollCache = useRef<Record<string, [number, number]>>({})
  const activeRestorePath = useRef<string>()

  useEffect(() => {
    if (history.scrollRestoration !== 'manual') {
      history.scrollRestoration = 'manual'
    }
    const getCurrentPath = () => location.pathname + location.search
    router.beforePopState(() => {
      activeRestorePath.current = getCurrentPath()
      return true
    })
    const onComplete = () => {
      const scrollPath = activeRestorePath.current
      if (!scrollPath || !(scrollPath in scrollCache.current)) {
        window.scrollTo(0, 0)
        return
      }

      activeRestorePath.current = undefined
      const [scrollX, scrollY] = scrollCache.current[scrollPath]
      window.scrollTo(scrollX, scrollY)
      // sometimes rendering the page can take a bit longer
      const delays = [30, 60, 120, 240, 480]
      const checkAndScroll = () => {
        if (
          (window.scrollX === scrollX && window.scrollY === scrollY) ||
          scrollPath !== getCurrentPath()
        ) {
          return
        }
        window.scrollTo(scrollX, scrollY)
        const delay = delays.shift()
        if (delay) {
          setTimeout(checkAndScroll, delay)
        }
      }
      setTimeout(checkAndScroll, delays.shift())
    }
    const onScroll = () => {
      scrollCache.current[getCurrentPath()] = [window.scrollX, window.scrollY]
    }
    router.events.on('routeChangeComplete', onComplete)
    window.addEventListener('scroll', onScroll)
    return () => {
      router.events.off('routeChangeComplete', onComplete)
      window.removeEventListener('scroll', onScroll)
    }
  }, [router])

  return (
    <>
      <GoogleAnalytics />
      <Head />
      <SWRConfig
        value={{
          suspense: true,
          revalidateOnFocus: false,
        }}
      >
        <Web3ConnectionProvider>
          <ThemeProvider>
            <Header />
            <SafeSuspense>
              <TransactionNotificationProvider>
                <TokenListProvider>
                  <ValidatorsProvider>{getLayout(<Component {...pageProps} />)}</ValidatorsProvider>
                  <Toast />
                </TokenListProvider>
              </TransactionNotificationProvider>
            </SafeSuspense>
            <TooltipConfig />
            <Footer />
          </ThemeProvider>
        </Web3ConnectionProvider>
      </SWRConfig>
    </>
  )
}
