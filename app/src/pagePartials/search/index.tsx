import styled from 'styled-components'
import React, { useState, useCallback, useEffect } from 'react'
import { Results } from '@/src/pagePartials/search/Results'
import { SimpleSearch } from '@/src/components/filters/SimpleSearch'
import { TextfieldStatus } from '@/src/components/form/Textfield'
import { isAddress } from 'ethers/lib/utils'
import { isTransactionHash } from '@/src/utils/tools'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useTransactionsFilters } from '@/src/hooks/useTransactionsFilters'

const Wrapper = styled.div`
  --wrapper-width: 954px;

  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  margin: 0 auto;
  max-width: 100%;
  padding: var(--layout-vertical-padding) 0;
  row-gap: 16px;
  width: var(--wrapper-width);
`

const SearchBox = styled.div`
  --search-box-padding-active: 30px 20px;
  --search-box-padding: 30px 20px;

  backdrop-filter: blur(7.5px);
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  box-shadow: 0 38.51852px 25.48148px 0 rgba(0, 0, 0, 0.12), 0 100px 80px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    --search-box-padding-active: 35px 85px;
    --search-box-padding: 50px 85px;
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    --search-box-padding-active: 40px 175px;
    --search-box-padding: 95px 175px;
  }
`

const Title = styled.h1`
  background: linear-gradient(
    80deg,
    ${({ theme: { colors } }) => colors.green_1} 21.77%,
    ${({ theme: { colors } }) => colors.green_2} 82.43%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 3.2rem;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.5px;
  margin: 0 0 16px;
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 4.2rem;
  }
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.creamDark};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 20px;
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 1.8rem;
    margin: 0 0 48px;

    br {
      display: none;
    }
  }
`

export const Search: React.FC = ({ ...restProps }) => {
  const router = useRouter()
  const { hash: byParamHash } = router.query
  const { filters, hash: currentHash, setHash } = useTransactionsFilters()
  const [error, setError] = useState<string>('')

  const handleHashChange = (value: string) => {
    const validHash = isTransactionHash(value) || isAddress(value)

    /**
     * Check if the input is a valid hash and also check if it's not the same as the current one.
     * If everything is OK, update the hash.
     */
    if (validHash && value !== currentHash) {
      setError('')
      setHash(value)
    }

    /**
     * If the input is not empty and also an invalid hash, trigger an error.
     */
    if (value !== '' && !validHash) {
      setError('Address or transaction hash is invalid')
    }

    /**
     * If the input is empty, remove the error.
     */
    if (value === '') {
      setError('')
    }
  }

  useEffect(() => {
    if (byParamHash) {
      handleHashChange(byParamHash as string)
    }
  }, [byParamHash])

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
      {/* Don't trigger <Results />'s hooks unnecessarily */}
      {filters.hash && <Results filters={filters} />}
    </Wrapper>
  )
}
