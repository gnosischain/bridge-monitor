const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import("next").NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  // i18n: {
  //   // ie
  //   // locales: ['en', 'es'],
  //   locales: ['en'],
  //   defaultLocale: 'en'
  // },
  images: {
    unoptimized: true,
    domains: [
      "tokens.1inch.io",
      "assets.coingecko.com",
      "ethereum-optimism.github.io"
    ]
  },
  // exportPathMap: async function (
  //   defaultPathMap,
  //   { dev, dir, outDir, distDir, buildId }
  // ) {
  //   return {
  //     '/': { page: '/' },
  //     // '/bridges': { page: '/bridges', query: { title: 'bridges' } },
  //     // '/validators': { page: '/validators', query: { title: 'lvalidators' } },
  //   }
  // },
});
