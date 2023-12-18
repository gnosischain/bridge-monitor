import NextHead from 'next/head'

export const Head = () => {
  const { hostname, port, protocol } =
    typeof window !== 'undefined'
      ? window.location
      : { hostname: 'localhost', port: 3000, protocol: 'http:' }
  const portString = port ? `:${port}` : ''
  const siteURL = typeof window !== 'undefined' ? `${protocol}//${hostname}${portString}` : ''
  const title = 'Gnosis Bridge Explorer'
  const description =
    'Real-time tracking of xDAI and OmniBridge bridging transactions at your fingertips, integrated claiming functionality, tons of analytics regarding bridge transactions, bridge information on all Gnosis Chain bridges, and the state of bridge validators.'
  const twitterHandle = '@gnosischain'

  return (
    <NextHead>
      <title>{title}</title>
      <meta content={description} name="description" />
      <meta content={title} property="og:title" />
      <meta content={siteURL} property="og:url" />
      <meta content={`${siteURL}/shareable/ogImage.jpg`} property="og:image" />
      <meta content="website" property="og:type" />
      <meta content={description} property="og:description" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={title} name="twitter:site" />
      <meta content={twitterHandle} name="twitter:creator" />
    </NextHead>
  )
}
