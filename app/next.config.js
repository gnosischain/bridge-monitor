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
    images: {
      remotePatterns: [
        {
          // The `src` property hostname must end with `.example.com`,
          // otherwise this will respond with 400 Bad Request.
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
  },
  images: {
    unoptimized: true,
    domains: ['tokens.1inch.io', 'assets.coingecko.com', 'ethereum-optimism.github.io'],
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: '**',
    //   },
    // ],
  },
})
