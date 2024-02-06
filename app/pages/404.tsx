import { NextPage } from 'next'
import Link from 'next/link'

import { GenericError } from '@/src/components/error/GenericError'

const Error404: NextPage = () => {
  return (
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
  )
}

export default Error404
