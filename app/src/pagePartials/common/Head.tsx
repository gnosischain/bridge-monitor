import NextHead from 'next/head'
import { WALLET_CONNECT_DAPP_URL } from '@/src/constants/config/common'

export const Head = () => {
  const { hostname, port, protocol } =
    typeof window !== 'undefined'
      ? window.location
      : { hostname: 'localhost', port: 3000, protocol: 'http:' }
  const portString = port ? `:${port}` : ''
  // Link previews read the server-rendered page, where there is no window: take the app's public URL
  // (set per environment for WalletConnect) so og:image is absolute there too.
  const siteURL = (
    WALLET_CONNECT_DAPP_URL ||
    (typeof window !== 'undefined' ? `${protocol}//${hostname}${portString}` : '')
  ).replace(/\/$/, '')
  const ogImage = `${siteURL}/images/shareable/ogImage.jpg`
  const title = 'Gnosis Bridge'
  const description =
    'Gnosis token bridging, real-time tracking of xDAI and OmniBridge bridging transactions at your fingertips, integrated claiming functionality, tons of analytics regarding bridge transactions, bridge information on all Gnosis Chain bridges, and the state of bridge validators.'
  const twitterHandle = '@gnosischain'

  return (
    <NextHead>
      <title>{title}</title>
      <meta content={description} name="description" />
      <meta content={title} property="og:title" />
      <meta content={siteURL} property="og:url" />
      <meta content={ogImage} property="og:image" />
      <meta content="1200" property="og:image:width" />
      <meta content="630" property="og:image:height" />
      <meta content="website" property="og:type" />
      <meta content={description} property="og:description" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={ogImage} name="twitter:image" />
      <meta content={title} name="twitter:site" />
      <meta content={twitterHandle} name="twitter:creator" />
    </NextHead>
  )
}
