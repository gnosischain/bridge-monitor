import styled from 'styled-components'

import { InnerCard } from '@/src/components/card/InnerCard'
import { BaseSubTitle as Title } from '@/src/components/text/BaseSubTitle'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { bridgeConfig } from '@/src/constants/bridges'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Chains } from '@/src/constants/config/chains'
import { ChainsKeys } from '@/src/constants/config/types'

const RowWrapper = styled.div`
  align-items: flex-start;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  font-weight: 400;
  justify-content: space-between;
  line-height: 1.2;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    align-items: center;
    flex-direction: row;
  }
`

const RowTitle = styled.span``

const Row: React.FC<{ address: string; title: string; network?: ChainsKeys }> = ({
  address,
  network,
  title,
  ...restProps
}) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <RowWrapper {...restProps}>
      <RowTitle>{title}</RowTitle>
      <TokenAddress
        address={address}
        characters={6}
        copy
        href={getExplorerUrl(address, network ?? 'mainnet')}
      />
    </RowWrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  gap: calc(var(--theme-common-space) * 2);
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: 1fr 1fr;
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const Card = styled(InnerCard)`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  flex-grow: 1;
  row-gap: calc(var(--theme-common-space) * 2);
`

const SubTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
`

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 2);
`

export const Configuration: React.FC = ({ ...restProps }) => {
  const { OMNI, XDAI } = bridgeConfig

  return (
    <Wrapper {...restProps}>
      <Column>
        <Title>xDai bridge configuration</Title>
        <Card>
          <SubTitle>Ethereum Addresses</SubTitle>
          <Rows>
            <Row address={XDAI.bridgeProxy[Chains.mainnet]} title="xDAI Bridge Contract" />
            <Row address={XDAI.bridgeRouter[Chains.mainnet]} title="Bridge Router Proxy Contract" />
            <Row address={XDAI.governorMultisig} title="Governor Multisig" />
            <Row address={XDAI.tokens.dai} title="DAI Token" />
            <Row address={XDAI.tokens.usds.usds} title="USDS Token" />
          </Rows>
          <SubTitle>Gnosis Chain Addresses</SubTitle>
          <Rows>
            <Row
              address={XDAI.bridgeProxy[Chains.gnosis]}
              network="gnosis"
              title="xDAI Bridge Contract"
            />
            <Row
              address={XDAI.tokens.usds.usdsDeposit}
              network="gnosis"
              title="USDS Deposit Contract"
            />
          </Rows>
        </Card>
      </Column>
      <Column>
        <Title>Omnibridge bridge configuration</Title>
        <Card>
          <SubTitle>Ethereum Addresses</SubTitle>
          <Rows>
            <Row address={OMNI.bridgeProxy[Chains.mainnet]} title="Omnibridge Mediator Proxy" />
            <Row address={OMNI.governorMultisig} title="Governor Multisig" />
            <Row address={OMNI.tokens.usdc.usdc} title="USDC Token" />
            <Row address={OMNI.tokens.usdt} title="USDT Token" />
          </Rows>
          <SubTitle>Gnosis Chain Addresses</SubTitle>
          <Rows>
            <Row
              address={OMNI.bridgeProxy[Chains.gnosis]}
              network="gnosis"
              title="Omnibridge Mediator Proxy"
            />
            <Row
              address={OMNI.tokens.usdc.usdcTransmuter}
              network="gnosis"
              title="USDC Transmuter contract"
            />
            <Row address={OMNI.tokens.usdc.usdcE} network="gnosis" title="USDC.e" />
            <Row address={OMNI.tokens.usdc.usdcXdai} network="gnosis" title="USDC on xDAI" />
          </Rows>
        </Card>
      </Column>
    </Wrapper>
  )
}
