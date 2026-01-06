'use client'

import { useEffect, useState } from 'react'
import { gnosis } from 'viem/chains'
import { Connector, useConnect, useConnectors } from 'wagmi'
import styled from 'styled-components'
import Image from 'next/image'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  min-width: 700px;
  min-height: 350px;

  @media (max-width: 768px) {
    flex-direction: column;
    min-width: 100%;
  }
`

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px;
  background: ${({ theme }) => theme.colors.creamDark};
  width: 40%;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    padding: 24px;
  }
`

const SidebarTitle = styled.h2`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 2.4rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
`

const SidebarDescription = styled.p`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 1.4rem;
  line-height: 1.5;
  margin: 0 0 32px 0;
  opacity: 0.8;
`

const DontHaveWallet = styled.a`
  margin-top: 32px;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: ${({ theme }) => theme.colors.cream};
  width: 60%;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 16px 0;
`

const WalletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`

const WalletButton = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.8;
  }
`

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
`

const WalletName = styled.span`
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
`

const InfoBadge = styled.span`
  width: 20px;
  height: 20px;
  background: #f5a623;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin-left: 2px;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textColor};
`

const DefaultIcon = styled.div`
  width: 28px;
  height: 28px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`

export function SelectWallet() {
  const [isMounted, setIsMounted] = useState(false)
  const { mutate: connect } = useConnect()
  const connectors = useConnectors()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const uniqueConnectors = connectors.reduce<Connector[]>((acc, connector) => {
    const names = acc.map((c) => c.name)
    if (!names.includes(connector.name)) {
      acc.push(connector)
    }
    return acc
  }, [])

  if (!isMounted) {
    return (
      <Container>
        <Sidebar>
          <SidebarTitle>Connect your wallet</SidebarTitle>
          <SidebarDescription>
            Connecting your wallet is like "logging in" to Web3. Select your wallet from the options
            to get started.
          </SidebarDescription>
        </Sidebar>
        <Content>
          <Title>Available Wallets</Title>
          <LoadingContainer>
            <span>Loading wallets...</span>
          </LoadingContainer>
        </Content>
      </Container>
    )
  }

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
        <Title>Available Wallets ({uniqueConnectors.length})</Title>
        <WalletList>
          {uniqueConnectors.map((connector) => (
            <WalletButton
              key={connector.uid}
              onClick={() =>
                connect({
                  connector: connector,
                  chainId: gnosis.id,
                })
              }
            >
              <IconWrapper>
                {connector.icon ? (
                  <Image alt={connector.name} src={connector.icon} />
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
