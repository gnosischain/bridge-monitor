// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import("next").NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  experimental: {
    scrollRestoration: false,
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
  },
  transpilePackages: ['@web3-name-sdk/core'],
})
