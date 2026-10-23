import styled from 'styled-components'

import { SectionHeader } from '@/src/components/sectionHeader'
import { Eyebrow } from '@/src/components/text/Eyebrow'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { Card } from '@/src/pagePartials/bridgeExplorer/bridges/Card'
import { Fact, Facts } from '@/src/pagePartials/bridgeExplorer/bridges/Fact'
import { bridgeConfig } from '@/src/constants/bridges'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Chains } from '@/src/constants/config/chains'
import { ChainsKeys } from '@/src/constants/config/types'

const Address = styled(TokenAddress)`
  svg {
    color: ${({ theme: { colors } }) => colors.faint};

    &:hover {
      color: ${({ theme: { colors } }) => colors.ink};
    }
  }
`

const Row: React.FC<{ address: string; title: string; network?: ChainsKeys }> = ({
  address,
  network,
  title,
}) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <Fact label={title}>
      <Address
        address={address}
        characters={6}
        copy
        href={getExplorerUrl(address, network ?? 'mainnet')}
      />
    </Fact>
  )
}

const Wrapper = styled.div`
  align-items: start;
  display: grid;
  gap: calc(var(--theme-common-space) * 5) calc(var(--theme-common-space) * 2);
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  row-gap: calc(var(--theme-common-space) * 2);
`

const AddressesCard = styled(Card)`
  row-gap: calc(var(--theme-common-space) * 4);
`

const Group = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--theme-common-space) * 1.5);
`

export const Configuration: React.FC = ({ ...restProps }) => {
  const { OMNI, XDAI } = bridgeConfig

  return (
    <Wrapper {...restProps}>
      <Section>
        <SectionHeader title="xDai bridge" />
        <AddressesCard>
          <Group>
            <Eyebrow>Ethereum addresses</Eyebrow>
            <Facts>
              <Row address={XDAI.bridgeProxy[Chains.mainnet]} title="xDAI Bridge Contract" />
              <Row
                address={XDAI.bridgeRouter[Chains.mainnet]}
                title="Bridge Router Proxy Contract"
              />
              <Row address={XDAI.governorMultisig} title="Governor Multisig" />
              <Row address={XDAI.tokens.dai} title="DAI Token" />
              <Row address={XDAI.tokens.usds.usds} title="USDS Token" />
            </Facts>
          </Group>
          <Group>
            <Eyebrow>Gnosis Chain addresses</Eyebrow>
            <Facts>
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
            </Facts>
          </Group>
        </AddressesCard>
      </Section>
      <Section>
        <SectionHeader title="Omnibridge" />
        <AddressesCard>
          <Group>
            <Eyebrow>Ethereum addresses</Eyebrow>
            <Facts>
              <Row address={OMNI.bridgeProxy[Chains.mainnet]} title="Omnibridge Mediator Proxy" />
              <Row address={OMNI.governorMultisig} title="Governor Multisig" />
              <Row address={OMNI.tokens.usdc.usdc} title="USDC Token" />
              <Row address={OMNI.tokens.usdt} title="USDT Token" />
            </Facts>
          </Group>
          <Group>
            <Eyebrow>Gnosis Chain addresses</Eyebrow>
            <Facts>
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
            </Facts>
          </Group>
        </AddressesCard>
      </Section>
    </Wrapper>
  )
}
