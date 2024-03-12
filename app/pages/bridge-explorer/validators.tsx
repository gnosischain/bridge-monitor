import type { NextPage } from 'next'

import { Validators, ValidatorsSkeleton } from '@/src/pagePartials/bridgeExplorer/validators'
import { ValidatorsProvider } from '@/src/providers/validatorsProvider'
import { genericSuspense } from '@/src/components/safeSuspense'
import NextHead from 'next/head'
import TokenListProvider from '@/src/providers/tokenListProvider'

const ValidatorsPage: NextPage = genericSuspense(
  () => {
    const title = 'Validators - Gnosis Bridge Explorer'
    const description = 'Current state of the bridge validators.'

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
        <TokenListProvider>
          <ValidatorsProvider>
            <Validators />
          </ValidatorsProvider>
        </TokenListProvider>
      </>
    )
  },
  () => <ValidatorsSkeleton />,
)

export default ValidatorsPage
