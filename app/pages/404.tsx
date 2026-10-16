import { NextPage } from 'next'
import Link from 'next/link'
import NextHead from 'next/head'
import styled, { css } from 'styled-components'

import { ButtonCSS, ButtonPrimaryCSS } from '@/src/components/buttons/Button'
import { Eyebrow } from '@/src/components/text/Eyebrow'
import { bridgeExplorerBaseURL } from '@/src/constants/sections'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 560px;
  padding: calc(var(--theme-common-space) * 8) 0;
  row-gap: calc(var(--theme-common-space) * 2);
  text-align: center;
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 4rem;
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
  line-height: 1.6;
  margin: 0;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--theme-common-space);
  justify-content: center;
  margin-top: var(--theme-common-space);
`

const ActionCSS = css`
  ${ButtonCSS}

  font-size: 1.5rem;
  height: 44px;
  padding: 0 calc(var(--theme-common-space) * 3);
`

const PrimaryAction = styled(Link)`
  ${ActionCSS}
  ${ButtonPrimaryCSS}
`

const SecondaryAction = styled(Link)`
  ${ActionCSS}

  background-color: ${({ theme: { colors } }) => colors.surface};
  border-color: ${({ theme: { colors } }) => colors.line};
  color: ${({ theme: { colors } }) => colors.ink};

  &:hover {
    border-color: ${({ theme: { colors } }) => colors.faint};
  }
`

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
      <Wrapper>
        <Eyebrow>Error 404</Eyebrow>
        <Title>Page not found</Title>
        <Text>
          The page you're looking for doesn't seem to exist. It may have been moved or deleted, or
          there may be a typo in the URL.
        </Text>
        <Actions>
          <PrimaryAction href="/">Go to the bridge</PrimaryAction>
          <SecondaryAction href={bridgeExplorerBaseURL}>Search a transaction</SecondaryAction>
        </Actions>
      </Wrapper>
    </>
  )
}

export default Error404
