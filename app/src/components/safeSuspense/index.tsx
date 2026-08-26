import React, { FC, Suspense } from 'react'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

import { GeneralError } from '@/src/components/error/GeneralError'
import { Loading } from '@/src/components/loading'
import isDev from '@/src/utils/isDev'

type Props = {
  children?: React.ReactNode
  fallback?: JSX.Element
}

function DefaultFallback(): JSX.Element {
  return <Loading />
}

/* Error boundary wired to react-query's reset mechanism. */
function ResettableErrorBoundary({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <GeneralError error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
          onError={(error, info) => isDev && console.error(error, info)}
          onReset={reset}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default function SafeSuspense({
  children,
  fallback = <DefaultFallback />,
}: Props): JSX.Element {
  return (
    <ResettableErrorBoundary>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ResettableErrorBoundary>
  )
}

export function genericSuspense<T extends object>(Element: FC<T>, fallback?: FC<T>) {
  return function GenericSuspenseReturnFunction(props: T) {
    return (
      <ResettableErrorBoundary>
        <Suspense fallback={fallback ? fallback(props) : <DefaultFallback />}>
          <Element {...props} />
        </Suspense>
      </ResettableErrorBoundary>
    )
  }
}
