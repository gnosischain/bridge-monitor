import styled from 'styled-components'
import React, { useEffect, useMemo, useState } from 'react'
import { Results } from '@/src/pagePartials/bridgeExplorer/search/Results'
import { SimpleSearch } from '@/src/pagePartials/bridgeExplorer/search/SimpleSearch'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { isTransactionHash } from '@/src/utils/tools'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'
import { isValidDomainName } from '@/src/utils/isValidDomainName'
import { isAddress } from 'viem'

const Wrapper = styled.div`
  --wrapper-width: 1080px;

  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  margin: auto;
  max-width: 100%;
  width: var(--wrapper-width);
`

const Card = styled.div`
  backdrop-filter: blur(1.3875000476837158px);
  background: rgba(248, 245, 237, 0.7);
  border-radius: calc(var(--theme-common-space) * 2);
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  box-shadow: 0 10.2px 7.8px 0 rgba(0, 0, 0, 0.01), 0 25.819px 20.925px 0 rgba(0, 0, 0, 0.02),
    0 51px 48px 0 rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  padding: var(--theme-common-space);
  row-gap: 16px;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }
`

const SearchBox = styled.div`
  --search-box-padding-active: 30px 20px;
  --search-box-padding: 30px 20px;

  backdrop-filter: blur(7.5px);
  background: linear-gradient(
      142deg,
      rgba(240, 235, 222, 0) 30.63%,
      rgba(240, 235, 222, 0.2) 84.81%
    ),
    linear-gradient(203deg, #6cac91 14.77%, #4b886e 85.24%), rgba(255, 255, 255, 0.2);
  border-radius: calc(var(--theme-common-space) * 2);
  backdrop-filter: blur(7.5px);
  box-shadow: 0px 100px 80px 0px rgba(46, 62, 55, 0.2);
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    --search-box-padding-active: 35px 85px;
    --search-box-padding: 50px 85px;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    --search-box-padding-active: 40px 175px;
    --search-box-padding: 100px 175px;
  }
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 3rem;
  font-weight: 500;
  line-height: 1.1;
  margin: 0 0 16px;
  text-align: center;
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 4.2rem;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.primaryDark};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 calc(var(--theme-common-space) * 3);
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 1.8rem;
    margin: 0 0 calc(var(--theme-common-space) * 4);

    br {
      display: none;
    }
  }
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

  const isSearchActive = currentHash !== ''
  const transitionTime = 0.35
  const searchBoxAnimationVariants = {
    initial: {
      padding: 'var(--search-box-padding)',
    },
    animate: {
      padding: 'var(--search-box-padding-active)',
    },
  }

  return (
    <Wrapper {...restProps}>
      <Card>
        <SearchBox
          animate={isSearchActive ? 'animate' : undefined}
          as={motion.div}
          initial="initial"
          transition={{
            duration: transitionTime,
            ease: 'easeInOut',
          }}
          variants={searchBoxAnimationVariants}
        >
          <Title>
            The Gnosis
            <br />
            Bridge Explorer
          </Title>
          <Text>
            Check real time transaction status
            <br /> and claim your tokens
          </Text>
          <SimpleSearch
            onChange={handleHashChange}
            status={error ? TextfieldStatus.error : undefined}
            statusMessage={error}
            value={filters.hash}
          />
        </SearchBox>
        <Results filters={filters} />
      </Card>
    </Wrapper>
  )
}
