import styled from 'styled-components'

import { InnerCard } from '@/src/components/card/InnerCard'
import { BaseSubTitle as Title } from '@/src/components/text/BaseSubTitle'
import { TokenAddress } from '@/src/components/token/TokenAddress'
import { bridgeConfig } from '@/src/constants/bridges'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const RowWrapper = styled.div`
  align-items: flex-start;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 400;
  justify-content: space-between;
  line-height: 1.2;

  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    align-items: center;
    flex-direction: row;
  }
`

const RowTitle = styled.span``

const Row: React.FC<{ address: string; title: string }> = ({ address, title, ...restProps }) => {
  const { getExplorerUrl } = useWeb3Connection()

  return (
    <RowWrapper {...restProps}>
      <RowTitle>{title}</RowTitle>
      <TokenAddress address={address} characters={6} copy href={getExplorerUrl(address)} />
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
  flex-grow: 1;
`

const SubTitle = styled.h3`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
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
            <Row address={XDAI.bridgeProxy} title="Bridge Proxy Contract" />
            <Row address={XDAI.governorMultisig} title="Governor Multisig" />
            <Row address={XDAI.tokens.dai} title="DAI Token" />
            <Row address={XDAI.protocol.address} title="Protocol" />
            <Row address={XDAI.protocol.token} title="Protocol Token" />
          </Rows>
        </Card>
      </Column>
      <Column>
        <Title>Omnibridge bridge configuration</Title>
        <Card>
          <SubTitle>Ethereum Addresses</SubTitle>
          <Rows>
            <Row address={OMNI.bridgeProxy} title="Omnibridge Mediator Proxy" />
            <Row address={OMNI.governorMultisig} title="Governor Multisig" />
            <Row address={OMNI.protocol.address} title="Protocol Interest Module" />
            <Row address={OMNI.tokens.usdc} title="USDC Token" />
            <Row address={OMNI.tokens.usdt} title="USDT Token" />
          </Rows>
        </Card>
      </Column>
    </Wrapper>
  )
}
