import { Connector, useConnect, useConnectors } from 'wagmi'
import styled from 'styled-components'
import Image from 'next/image'
import { EyebrowCSS } from '@/src/components/text/Eyebrow'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 360px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Sidebar = styled.div`
  background-color: ${({ theme: { colors } }) => colors.page};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: center;
  padding: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 4);
  width: 40%;

  @media (max-width: 768px) {
    padding: calc(var(--theme-common-space) * 3);
    width: 100%;
  }
`

const SidebarTitle = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 2.8rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.15;
  margin: 0 0 calc(var(--theme-common-space) * 1.5);
`

const SidebarDescription = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  line-height: 1.6;
  margin: 0;
`

const DontHaveWallet = styled.a`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.violet};
  display: flex;
  font-size: 1.4rem;
  font-weight: 600;
  gap: 6px;
  margin-top: calc(var(--theme-common-space) * 3);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Content = styled.div`
  background-color: ${({ theme: { colors } }) => colors.surface};
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 7) calc(var(--theme-common-space) * 3)
    calc(var(--theme-common-space) * 3);
  width: 60%;

  @media (max-width: 768px) {
    padding: calc(var(--theme-common-space) * 3);
    width: 100%;
  }
`

const Title = styled.h3`
  ${EyebrowCSS}

  margin: 0 0 calc(var(--theme-common-space) * 1.5);
`

const WalletList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--theme-common-space);
`

const WalletButton = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  cursor: pointer;
  display: flex;
  gap: calc(var(--theme-common-space) * 1.5);
  padding: 10px 12px;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  width: 100%;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.page};
    border-color: ${({ theme: { colors } }) => colors.faint};
  }

  &:active {
    opacity: 0.8;
  }
`

const IconWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  overflow: hidden;
  width: 40px;

  img {
    height: 26px;
    object-fit: contain;
    width: 26px;
  }
`

const WalletName = styled.span`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.5rem;
  font-weight: 600;
`

const InfoBadge = styled.span`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.violet};
  border-radius: 50%;
  color: ${({ theme: { colors } }) => colors.surface};
  display: flex;
  font-size: 1rem;
  font-weight: 700;
  height: 16px;
  justify-content: center;
  width: 16px;
`

const DefaultIcon = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.violet};
  border-radius: 6px;
  color: ${({ theme: { colors } }) => colors.surface};
  display: flex;
  font-size: 1.2rem;
  font-weight: bold;
  height: 26px;
  justify-content: center;
  width: 26px;
`

export function SelectWallet() {
  const { mutate: connect } = useConnect()
  const connectors = useConnectors()

  const uniqueConnectors = connectors.reduce<Connector[]>((acc, connector) => {
    const names = acc.map((c) => c.name)
    if (!names.includes(connector.name)) {
      acc.push(connector)
    }
    return acc
  }, [])

  const availableConnectors = uniqueConnectors.filter(
    (connector) => connector.id !== 'safe' && connector.id !== 'injected',
  )

  return (
    <Container>
      <Sidebar>
        <SidebarTitle>Connect your wallet</SidebarTitle>
        <SidebarDescription>
          Connecting your wallet is like "logging in" to Web3. Select your wallet from the options
          to get started.
        </SidebarDescription>
        <DontHaveWallet
          href="https://ethereum.org/en/wallets/find-wallet/"
          rel="noopener noreferrer"
          target="_blank"
        >
          I don't have a wallet <InfoBadge>i</InfoBadge>
        </DontHaveWallet>
      </Sidebar>
      <Content>
        <Title>Available Wallets ({availableConnectors.length})</Title>
        <WalletList>
          {availableConnectors.map((connector) => (
            <WalletButton
              key={connector.uid}
              onClick={() =>
                connect({
                  connector: connector,
                })
              }
              type="button"
            >
              <IconWrapper>
                {connector.icon ? (
                  <Image alt={connector.name} height={28} src={connector.icon} width={28} />
                ) : connector.name === 'WalletConnect' ? (
                  <Image
                    alt={connector.name}
                    height={28}
                    src="/images/icons/wallet-connect.svg"
                    width={28}
                  />
                ) : (
                  <DefaultIcon>{connector.name.charAt(0).toUpperCase()}</DefaultIcon>
                )}
              </IconWrapper>
              <WalletName>{connector.name}</WalletName>
            </WalletButton>
          ))}
        </WalletList>
      </Content>
    </Container>
  )
}
