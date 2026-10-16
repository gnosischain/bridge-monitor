import styled from 'styled-components'
import { Alert } from '@/src/components/assets/Alert'
import { Close } from '@/src/components/assets/Close'
import { useLocalStorage } from '@/src/hooks/usePersistedState'
import { mainnetToGnosisTime } from '@/src/utils/txTime'

export const FCR_DOCS_URL = 'https://docs.gnosischain.com/bridges/fast-confirmation-rule'

// Bump the version suffix to show the banner again to everyone who already dismissed it.
const DISMISSED_STORAGE_KEY = 'fcr_banner_dismissed_v1'

const Wrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.ink};
  color: ${({ theme: { colors } }) => colors.surface};
  flex-shrink: 0;
  margin-bottom: calc(var(--theme-common-space) * -4);
  position: relative;
  width: 100%;
`

const Inner = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
  font-size: 1.3rem;
  font-weight: 400;
  justify-content: center;
  line-height: 1.45;
  margin: 0 auto;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  min-height: 36px;
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 6) var(--theme-common-space)
    calc(var(--theme-common-space) * 2);
`

const Icon = styled(Alert)`
  flex-shrink: 0;
  height: 16px;
  width: 16px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.mint};
  }
`

const Text = styled.p`
  margin: 0;
`

const Emphasize = styled.span`
  font-weight: 600;
`

const DocsLink = styled.a`
  color: ${({ theme: { colors } }) => colors.mint};
  font-weight: 600;
  text-decoration: none;
  text-underline-offset: 3px;
  white-space: nowrap;

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
  height: 28px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: var(--theme-common-space);
  top: 50%;
  transform: translateY(-50%);
  width: 28px;

  .fill {
    fill: ${({ theme: { colors } }) => colors.faint};
  }

  &:hover {
    background-color: rgba(255, 250, 251, 0.12);
  }

  &:hover .fill {
    fill: ${({ theme: { colors } }) => colors.surface};
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
      </Inner>
      <DismissButton
        aria-label="Dismiss the Fast Confirmation Rule announcement"
        onClick={() => setIsDismissed(true)}
        type="button"
      >
        <Close height={12} width={12} />
      </DismissButton>
    </Wrapper>
  )
}
