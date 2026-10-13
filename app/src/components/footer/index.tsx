import Image from 'next/image'
import styled, { css } from 'styled-components'
import NextLink from 'next/link'

import { GnosisChainLogo } from '@/src/components/assets/GnosisChainLogo'
import { FCR_DOCS_URL } from '@/src/components/banner/FcrBanner'
import { BuildInfo } from '@/src/components/footer/BuildInfo'
import { InnerContainer as BaseInnerContainer } from '@/src/components/innerContainer'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

const DOCS_URL = 'https://docs.gnosischain.com'

// The build.gnosischain.com footer columns, with the bridge's own help links first.
const COLUMNS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Bridge',
    items: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Documentation', href: `${DOCS_URL}/bridges/` },
      { label: 'Fast Confirmation Rule', href: FCR_DOCS_URL },
    ],
  },
  {
    title: 'Network',
    items: [
      { label: 'Network details', href: `${DOCS_URL}/about/networks/` },
      { label: 'Faucets', href: `${DOCS_URL}/tools/Faucets` },
      { label: 'Explorer', href: 'https://gnosis.blockscout.com' },
      { label: 'Ecosystem', href: 'https://build.gnosischain.com' },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Discord', href: 'https://discord.gg/gnosis' },
      { label: 'Forum', href: 'https://forum.gnosis.io/' },
      { label: 'X', href: 'https://x.com/gnosis_' },
      { label: 'GitHub', href: 'https://github.com/gnosischain' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'DAO', href: 'https://snapshot.org/#/gnosis.eth' },
      { label: 'Careers', href: 'https://gnosis.io/careers/' },
      { label: 'Media kit', href: 'https://www.gnosis.io/press' },
      { label: 'Terms of use', href: `${DOCS_URL}/terms-conditions` },
    ],
  },
]

const Wrapper = styled.footer`
  background-color: ${({ theme: { colors } }) => colors.mist};
  border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  margin-top: calc(var(--theme-common-space) * 4);
  padding: calc(var(--theme-common-space) * 6) 0 calc(var(--theme-common-space) * 4);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 7);
  }
`

const Top = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 5);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    flex-direction: row;
    justify-content: space-between;
  }
`

const Logo = styled(GnosisChainLogo)`
  height: 26px;
  width: auto;
`

const Columns = styled.div`
  display: grid;
  gap: calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 3);
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(4, minmax(160px, 1fr));
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    column-gap: calc(var(--theme-common-space) * 6);
  }
`

const ColumnTitle = styled.p`
  ${EyebrowCSS}
  margin: 0 0 calc(var(--theme-common-space) * 1.5);
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  row-gap: var(--theme-common-space);
`

const LinkCSS = css`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  line-height: 1.4;
  text-decoration: none;

  &:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }
`

const InternalLink = styled(NextLink)`
  ${LinkCSS}
`

const ExternalLink = styled.a`
  ${LinkCSS}
`

const Arrow = styled.span`
  color: ${({ theme: { colors } }) => colors.faint};
  margin-left: 4px;
`

const Bottom = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme: { colors } }) => colors.line};
  color: ${({ theme: { colors } }) => colors.faint};
  display: flex;
  flex-wrap: wrap;
  font-size: 1.3rem;
  gap: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
  justify-content: space-between;
  line-height: 1.5;
  margin-top: calc(var(--theme-common-space) * 5);
  padding-top: calc(var(--theme-common-space) * 3);
`

const Meta = styled.div`
  align-items: center;
  column-gap: calc(var(--theme-common-space) * 3);
  display: flex;
  flex-wrap: wrap;
  row-gap: var(--theme-common-space);
`

const BuiltBy = styled.a`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.faint};
  column-gap: var(--theme-common-space);
  display: flex;
  text-decoration: none;

  &:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }
`

export const Footer: React.FC = (props) => {
  const year = new Date().getFullYear()

  return (
    <Wrapper {...props}>
      <BaseInnerContainer>
        <Top>
          <NextLink aria-label="Gnosis Bridge home" href="/">
            <Logo />
          </NextLink>
          <Columns>
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <ColumnTitle>{column.title}</ColumnTitle>
                <List>
                  {column.items.map((item) => (
                    <li key={item.label}>
                      {item.href.startsWith('/') ? (
                        <InternalLink href={item.href}>{item.label}</InternalLink>
                      ) : (
                        <ExternalLink href={item.href} rel="noopener noreferrer" target="_blank">
                          {item.label}
                          <Arrow aria-hidden="true">↗</Arrow>
                        </ExternalLink>
                      )}
                    </li>
                  ))}
                </List>
              </div>
            ))}
          </Columns>
        </Top>
        <Bottom>
          <span>Copyright © {year} Gnosis</span>
          <Meta>
            <BuildInfo />
            <BuiltBy
              href="https://www.bootnode.dev/"
              rel="noreferrer"
              target="_blank"
              title="BootNode - Web3 Development"
            >
              Built by <Image alt="BootNode logo" height={15} src="/images/bn.svg" width={19} />
            </BuiltBy>
          </Meta>
        </Bottom>
      </BaseInnerContainer>
    </Wrapper>
  )
}
