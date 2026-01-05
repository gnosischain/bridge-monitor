// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://assets.coingecko.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://indexer.hyperindex.xyz https://rpc.gnosischain.com/ https://tokens.coingecko.com https://rpc.ankr.com/eth https://ethereum-rpc.publicnode.com/;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`

/** @type {import("next").NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tokens.1inch.io',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'ethereum-optimism.github.io',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['@web3-name-sdk/core'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
})
