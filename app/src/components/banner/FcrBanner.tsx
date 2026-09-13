import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Alert } from '@/src/components/assets/Alert'
import { Close } from '@/src/components/assets/Close'
import { InnerContainer } from '@/src/components/innerContainer'
import { useLocalStorage } from '@/src/hooks/usePersistedState'
import { mainnetToGnosisTime } from '@/src/utils/txTime'

export const FCR_DOCS_URL = 'https://docs.gnosischain.com/bridges/fast-confirmation-rule'

// Bump the version suffix to show the banner again to everyone who already dismissed it.
const DISMISSED_STORAGE_KEY = 'fcr_banner_dismissed_v1'

const Wrapper = styled(InnerContainer)`
  flex-grow: 0;
`

const Inner = styled.div`
  align-items: flex-start;
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  color: ${({ theme: { colors } }) => colors.primary};
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.35;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
`

const Icon = styled(Alert)`
  height: 22px;
  margin-top: 1px;
  width: 22px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.success};
  }
`

const Text = styled.p`
  flex-grow: 1;
  margin: 0;
`

const Emphasize = styled.span`
  font-weight: 700;
`

const DocsLink = styled.a`
  color: ${({ theme: { colors } }) => colors.primary};
  font-weight: 700;
  text-decoration: underline;

  &:hover {
    color: ${({ theme: { colors } }) => colors.primaryLight};
  }
`

const DismissButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin-top: 3px;
  padding: calc(var(--theme-common-space) / 2);

  .fill {
    fill: ${({ theme: { colors } }) => colors.primary};
  }

  &:hover .fill {
    fill: ${({ theme: { colors } }) => colors.primaryLight};
  }
`

export const FcrBanner: React.FC = ({ ...restProps }) => {
  const [isDismissed, setIsDismissed] = useLocalStorage<boolean>(DISMISSED_STORAGE_KEY, false)
  // `useLocalStorage` can only read the stored flag on the client, so for an already-dismissed user
  // the server markup and the first client render would disagree. Hold the banner back until after
  // mount to keep hydration consistent.
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || isDismissed) return null

  return (
    <Wrapper {...restProps}>
      <Inner>
        <Icon />
        <Text>
          The <Emphasize>Fast Confirmation Rule</Emphasize> is now integrated into the bridge.
          Transfers from Ethereum to Gnosis Chain are now confirmed in{' '}
          <Emphasize>{mainnetToGnosisTime}</Emphasize> instead of ~17 minutes.{' '}
          <DocsLink href={FCR_DOCS_URL} rel="noopener noreferrer" target="_blank">
            Learn more
          </DocsLink>
        </Text>
        <DismissButton
          aria-label="Dismiss the Fast Confirmation Rule announcement"
          onClick={() => setIsDismissed(true)}
          type="button"
        >
          <Close height={12} width={12} />
        </DismissButton>
      </Inner>
    </Wrapper>
  )
}
