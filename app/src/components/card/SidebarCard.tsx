import styled from 'styled-components'
import { MainCard } from '@/src/components/card/MainCard'

export const Wrapper = styled(MainCard)`
  padding-top: calc(var(--theme-common-space) * 5);
  padding-bottom: calc(var(--theme-common-space) * 5);
  row-gap: 0;
`

export const SidebarCard = Wrapper

export const SCTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 2.4rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 calc(var(--theme-common-space) * 2);
`

export const SCText = styled.p`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 calc(var(--theme-common-space) * 4);
`

export const SCLink = styled.a`
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE1Ljg1MyAxMC4zNTRsLTQuNSA0LjVhLjUuNSAwIDAxLS43MDctLjcwOGwzLjY0Ny0zLjY0Nkg0LjVhLjUuNSAwIDAxMC0xaDkuNzkzbC0zLjY0Ny0zLjY0NmEuNS41IDAgMDEuNzA3LS43MDdsNC41IDQuNWEuNTAyLjUwMiAwIDAxMCAuNzA3eiIgZmlsbD0iIzNFNjk1NyIvPjwvc3ZnPg==');
  align-items: center;
  background-position: calc(100% - var(--theme-common-space) * 2) 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: calc(var(--theme-common-space) * 2);
  cursor: pointer;
  display: flex;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  padding: var(--theme-common-space) calc(20px - var(--theme-common-space) * 4)
    var(--theme-common-space) calc(var(--theme-common-space) * 2);
  text-decoration: none;
  transition: background-color 0.15s linear, color 0.15s linear;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.creamDarker};
    color: ${({ theme: { colors } }) => colors.primaryDark};
  }

  &:active {
    opacity: 0.7;
  }
`

SCLink.defaultProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
}
