import styled from 'styled-components'
import React, { useEffect, useMemo, useState } from 'react'
import { Results } from '@/src/pagePartials/bridgeExplorer/search/Results'
import { SimpleSearch } from '@/src/pagePartials/bridgeExplorer/search/SimpleSearch'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { isAddress } from 'viem'
import { isTransactionHash } from '@/src/utils/tools'
import { useRouter } from 'next/router'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { isValidDomainName } from '@/src/utils/isValidDomainName'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  row-gap: calc(var(--theme-common-space) * 4);
  width: 100%;
`

const Hero = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3) 0 0;
  row-gap: calc(var(--theme-common-space) * 1.5);
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 6);
  }
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 3.6rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.06;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 5.6rem;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.8rem;
  }
`

const SearchBox = styled.div`
  margin-top: calc(var(--theme-common-space) * 2);
  max-width: 640px;
  width: 100%;
`

export const Search: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const { hash: byParamHash } = useMemo(() => router.query, [router.query])
  const byParamHashString = byParamHash as string

  const isValidHash = (value: string) => {
    return isTransactionHash(value) || isAddress(value) || isValidDomainName(value)
  }
  const isEmptyHash = (value: string) => value === ''

  const {
    filters,
    hash: currentHash,
    setHash,
  } = useTransactionsFilters({
    hash:
      isValidHash(byParamHashString) && !isEmptyHash(byParamHashString) ? byParamHashString : '',
  })

  const [error, setError] = useState<string>('')
  const errorMessage = 'Address or transaction hash is invalid'

  const handleHashChange = (value: string) => {
    /**
     * Check if the input is a valid hash and also check if it's not the same as the current one.
     *
     * If everything is OK:
     * - Remove the existing error.
     * - Update the hash.
     */
    if (isValidHash(value) && value !== currentHash) {
      setError('')
      setHash(value)
    }

    /**
     * If the input is not empty and also an invalid hash, trigger an error.
     */
    if (!isEmptyHash(value) && !isValidHash(value)) {
      setError(errorMessage)
    }

    /**
     * If the input is empty, remove the error.
     */
    if (isEmptyHash(value)) {
      setError('')
    }
  }

  useEffect(() => {
    if (byParamHashString) {
      if (isValidHash(byParamHashString)) {
        setHash(byParamHashString)
      } else {
        setError(errorMessage)
      }
    }
  }, [byParamHashString, setHash])

  return (
    <Wrapper {...restProps}>
      <Hero>
        <Title>The Gnosis Bridge Explorer</Title>
        <Text>Check real time transaction status and claim your tokens.</Text>
        <SearchBox>
          <SimpleSearch
            onChange={handleHashChange}
            status={error ? TextfieldStatus.error : undefined}
            statusMessage={error}
            value={filters.hash}
          />
        </SearchBox>
      </Hero>
      <Results filters={filters} />
    </Wrapper>
  )
}
