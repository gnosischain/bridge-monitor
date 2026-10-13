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
  background-color: ${({ theme: { colors } }) => colors.surface};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  color: ${({ theme: { colors } }) => colors.ink};
  column-gap: calc(var(--theme-common-space) * 1.5);
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.5;
  padding: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 1.75) calc(var(--theme-common-space) * 2.5);
  }
`

const Icon = styled(Alert)`
  height: 20px;
  margin-top: 1px;
  width: 20px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.success};
  }
`

const Text = styled.p`
  flex-grow: 1;
  margin: 0;
`

const Emphasize = styled.span`
  font-weight: 600;
`

const DocsLink = styled.a`
  color: ${({ theme: { colors } }) => colors.violet};
  font-weight: 600;
  text-decoration: none;
  text-underline-offset: 4px;

  &:hover {
    text-decoration: underline;
  }
`

const DismissButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  padding: 0;
  width: 24px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.fog};
  }

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }

  &:hover .fill {
    fill: ${({ theme: { colors } }) => colors.ink};
  }
`

// Rendered inside the client-only `Web3ConnectionProvider`, so `useLocalStorage` reads the stored
// flag on the first render and there is no server markup to hydrate against.
export const FcrBanner: React.FC = ({ ...restProps }) => {
  const [isDismissed, setIsDismissed] = useLocalStorage<boolean>(DISMISSED_STORAGE_KEY, false)

  if (isDismissed) return null

  return (
    <Wrapper {...restProps}>
      <Inner>
        <Icon />
        <Text>
          The <Emphasize>Fast Confirmation Rule</Emphasize> is now integrated into the bridge.
          Transfers from Ethereum to Gnosis Chain are now confirmed in ~
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
