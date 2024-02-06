import Image from 'next/image'
import styled, { css } from 'styled-components'
import NextLink from 'next/link'

import { GnosisChain } from '@/src/components/assets/GnosisChain'
import { InnerContainer as BaseInnerContainer } from '@/src/components/innerContainer'

const Wrapper = styled.footer`
  color: ${({ theme: { colors } }) => colors.primary};
  margin-top: var(--theme-common-space);
  padding: 0 0 calc(var(--theme-common-space) * 5);
  width: 100%;
`

const InnerContainer = styled(BaseInnerContainer)`
  align-items: center;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
  }
`

const TextCSS = css`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.5;
`

const Start = styled.div`
  ${TextCSS}

  align-items: center;
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    column-gap: calc(var(--theme-common-space) * 4);
    flex-direction: row;
  }
`

const Text = styled.span`
  ${TextCSS}
`

const ExternalLink = styled.a`
  ${TextCSS}

  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.2rem;
  text-decoration: none;

  &:active {
    opacity: 0.8;
  }
`

const End = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 5);
  display: flex;
`

const Link = styled.a`
  ${TextCSS}

  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.2rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    opacity: 0.8;
  }
`

export const Footer: React.FC = (props) => {
  const year = new Date().getFullYear()

  return (
    <Wrapper {...props}>
      <InnerContainer>
        <Start>
          <GnosisChain />
          <Text>Copyright © {year} Gnosis | All rights reserved</Text>
          <ExternalLink
            href="https://www.bootnode.dev/"
            rel="noreferrer"
            target="_blank"
            title="BootNode - Web3 Development"
          >
            Built by <Image alt="BootNode logo" height={15} src="/images/bn.svg" width={19} />
          </ExternalLink>
        </Start>
        <End>
          <NextLink href="/privacy" passHref>
            <Link>Privacy Policy</Link>
          </NextLink>
          <NextLink href="/terms" passHref>
            <Link>Terms &amp; Conditions</Link>
          </NextLink>
        </End>
      </InnerContainer>
    </Wrapper>
  )
}
