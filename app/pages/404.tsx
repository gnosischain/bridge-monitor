import { NextPage } from 'next'
import Link from 'next/link'

import { GenericError } from '@/src/components/error/GenericError'
import NextHead from 'next/head'

const Error404: NextPage = () => {
  const title = 'Page not found - Gnosis Bridge Explorer'
  const description = "The page you're looking for doesn't seem to exist"

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <meta content={description} name="description" />
        <meta content={title} property="og:title" />
        <meta content="website" property="og:type" />
        <meta content={description} property="og:description" />
        <meta content={title} name="twitter:site" />
      </NextHead>
      <GenericError
        text={
          <>
            <span>
              Sorry, but <b>the page you're looking for doesn't seem to exist</b>. It may have been
              moved or deleted.
            </span>
            <span>
              Please double-check the URL for any typos or try navigating to the content you were
              looking for from <Link href="/">the homepage</Link>.
            </span>
          </>
        }
        title="Error 404"
      />
    </>
  )
}

export default Error404
