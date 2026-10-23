import { Inter, Playfair_Display } from 'next/font/google'

// The gnosis.io typefaces. next/font downloads them at build time and serves them from this app,
// so the browser never calls Google Fonts.
export const inter = Inter({ display: 'swap', subsets: ['latin'] })

export const playfairDisplay = Playfair_Display({ display: 'swap', subsets: ['latin'] })
