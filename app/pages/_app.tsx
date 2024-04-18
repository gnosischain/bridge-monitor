import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode, useEffect } from 'react'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { SWRConfig } from 'swr'
import SafeSuspense from '@/src/components/safeSuspense'
import { SingleColumnLayout } from '@/src/components/singleColumnLayout'
import Toast from '@/src/components/toast'
import { Head } from '@/src/pagePartials/common/Head'
import { TransactionNotificationProvider } from '@/src/providers/transactionNotificationProvider'
import ThemeProvider from '@/src/providers/themeProvider'
import TooltipConfig from '@/src/components/tooltip/TooltipConfig'
import { useRef } from 'react'
import { Header } from '@/src/components/header'
import { Footer } from '@/src/components/footer'

import dynamic from 'next/dynamic'

const Web3ConnectionProvider = dynamic(() => import('@/src/providers/web3ConnectionProvider'), {
  ssr: false,
})

import 'sanitize.css'
import 'react-tooltip/dist/react-tooltip.css'
import 'react-datepicker/dist/react-datepicker.css'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Black magic explained here https://nextjs.org/docs/basic-features/layouts
  const getLayout =
    Component.getLayout ?? ((page) => <SingleColumnLayout>{page}</SingleColumnLayout>)
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
            <SafeSuspense>
              <Header />
              {/* <SafeSuspense> */}
              <TransactionNotificationProvider>
                {getLayout(<Component {...pageProps} />)}
                <Toast />
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
