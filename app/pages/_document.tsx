import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shouldForwardProp = (propName: string, target: any) => {
      return typeof target === 'string' ? isPropValid(propName) : true
    }

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(
              <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                <App {...props} />
              </StyleSheetManager>,
            ),
        })
      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render = () => {
    return (
      <Html lang="en">
        <Head>
          <link href="/favicon/favicon.svg" rel="icon" type="image/svg+xml" />
          <link href="/favicon/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
          <link href="/favicon/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
          <link href="/favicon/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
          <link href="/manifest.json" rel="manifest" />
          <meta content="#F6F1FA" name="theme-color"></meta>
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="modals" />
        </body>
      </Html>
    )
  }
}
