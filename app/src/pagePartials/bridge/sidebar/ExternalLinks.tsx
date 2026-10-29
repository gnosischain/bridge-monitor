import styled from 'styled-components'
import { SCText, SCTitle, Wrapper } from '@/src/components/card/SidebarCard'
import { EXTERNAL_BRIDGES } from '@/src/constants/externalBridges'

const Links = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
`

const Link = styled.a`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: 999px;
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: 4px;
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  height: 32px;
  padding: 0 calc(var(--theme-common-space) * 1.5);
  text-decoration: none;
  transition: background-color 0.15s linear;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }
`

const Arrow = styled.span`
  color: ${({ theme: { colors } }) => colors.faint};
`

export const ExternalLinks: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <SCTitle>Coming from another chain?</SCTitle>
      <SCText>You might be interested in trying:</SCText>
      <Links>
        {EXTERNAL_BRIDGES.map((link) => (
          <li key={link.name}>
            <Link href={link.url} rel="noopener noreferrer" target="_blank">
              {link.name}
              <Arrow aria-hidden="true">↗</Arrow>
            </Link>
          </li>
        ))}
      </Links>
    </Wrapper>
  )
}
