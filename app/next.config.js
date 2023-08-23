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
  images: {
    unoptimized: true,
    domains: ['/', 'tokens.1inch.io', 'assets.coingecko.com', 'ethereum-optimism.github.io'],
  },
})
