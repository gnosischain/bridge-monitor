import styled from 'styled-components'
import { MainCard } from '@/src/components/card/MainCard'

export const Wrapper = styled(MainCard)`
  padding: calc(var(--theme-common-space) * 2.5) calc(var(--theme-common-space) * 2);
  row-gap: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }
`

export const SidebarCard = Wrapper

export const SCTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin: 0 0 4px;
`

export const SCText = styled.p<{ error?: boolean }>`
  color: ${({ error, theme: { colors } }) => (error ? colors.error : colors.fog)};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0 0 calc(var(--theme-common-space) * 2);
`

export const SCLink = styled.a`
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE1Ljg1MyAxMC4zNTRsLTQuNSA0LjVhLjUuNSAwIDAxLS43MDctLjcwOGwzLjY0Ny0zLjY0Nkg0LjVhLjUuNSAwIDAxMC0xaDkuNzkzbC0zLjY0Ny0zLjY0NmEuNS41IDAgMDEuNzA3LS43MDdsNC41IDQuNWEuNTAyLjUwMiAwIDAxMCAuNzA3eiIgZmlsbD0iIzA3MDUyQyIvPjwvc3ZnPg==');
  align-items: center;
  background-position: calc(100% - var(--theme-common-space) * 2) 50%;
  background-repeat: no-repeat;
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: calc(var(--theme-common-space) * 1.5);
  cursor: pointer;
  display: flex;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 calc(var(--theme-common-space) * -1.5);
  padding: calc(var(--theme-common-space) * 1.25) calc(var(--theme-common-space) * 5)
    calc(var(--theme-common-space) * 1.25) calc(var(--theme-common-space) * 1.5);
  text-decoration: none;
  transition:
    background-color 0.15s linear,
    color 0.15s linear;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.page};
    color: ${({ theme: { colors } }) => colors.ink};
  }

  &:active {
    opacity: 0.7;
  }
`

SCLink.defaultProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
}
