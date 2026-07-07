import styled from 'styled-components'

import { appEnv, commitSha } from '@/src/constants/config/common'

const GITHUB_REPO_URL = 'https://github.com/gnosischain/bridge-monitor'

// The badge is intentionally restricted to the develop environment. Gating in
// code (not just on the presence of a build-arg) keeps it off staging and
// production even if NEXT_PUBLIC_COMMIT_SHA is ever injected there by mistake.
const VISIBLE_ENV = 'develop'

const BuildLink = styled.a`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: calc(var(--theme-common-space) / 2);
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.6;
  text-decoration: none;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }

  &:active {
    opacity: 0.8;
  }
`

const Sha = styled.code`
  font-family: monospace;
  font-size: 1.2rem;
`

/**
 * Shows the deployed commit (env label + short SHA) linked to GitHub.
 * Renders only on the develop environment, and only when a commit SHA was
 * injected at build time — so it never appears on staging or production.
 */
export const BuildInfo: React.FC = () => {
  if (appEnv !== VISIBLE_ENV || !commitSha) return null

  const shortSha = commitSha.slice(0, 7)

  return (
    <BuildLink
      href={`${GITHUB_REPO_URL}/commit/${commitSha}`}
      rel="noreferrer"
      target="_blank"
      title={`Deployed commit ${commitSha}`}
    >
      {appEnv} · <Sha>{shortSha}</Sha>
    </BuildLink>
  )
}
