import styled from 'styled-components'

import { InnerCard } from '@/src/components/common/InnerCard'
import { BaseSubTitle as Title } from '@/src/components/text/BaseSubTitle'
import { Address } from '@/src/components/token/Address'
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
      <Address address={address} characters={6} copy link={getExplorerUrl(address)} />
    </RowWrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme: { common } }) => common.space * 2}px;
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
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
`

export const Configuration: React.FC = ({ ...restProps }) => (
  <Wrapper {...restProps}>
    <Column>
      <Title>xDai bridge configuration</Title>
      <Card>
        <SubTitle>Ethereum Addresses</SubTitle>
        <Rows>
          <Row address={bridgeConfig.XDAI.bridgeProxy} title="Bridge Proxy Contract" />
          <Row address={bridgeConfig.XDAI.governorMultisig} title="Governor Multisig" />
          <Row address={bridgeConfig.XDAI.tokens.dai} title="DAI Token" />
          <Row address={bridgeConfig.XDAI.protocol.address} title="Protocol" />
          <Row address={bridgeConfig.XDAI.protocol.token} title="Protocol Token" />
        </Rows>
      </Card>
    </Column>
    <Column>
      <Title>Omnibridge bridge configuration</Title>
      <Card>
        <SubTitle>Ethereum Addresses</SubTitle>
        <Rows>
          <Row address={bridgeConfig.OMNI.bridgeProxy} title="Omnibridge Mediator Proxy" />
          <Row address={bridgeConfig.OMNI.governorMultisig} title="Governor Multisig" />
          <Row address={bridgeConfig.OMNI.protocol.address} title="Protocol Interest Module" />
          <Row address={bridgeConfig.OMNI.tokens.usdc} title="USDC Token" />
          <Row address={bridgeConfig.OMNI.tokens.usdt} title="USDT Token" />
        </Rows>
      </Card>
    </Column>
  </Wrapper>
)
