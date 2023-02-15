import styled from 'styled-components'

import { InnerCard } from '@/src/components/common/InnerCard'
import { BaseSubTitle as Title } from '@/src/components/text/BaseSubTitle'
import { Address } from '@/src/components/token/Address'
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
      <Address address={address} characters={8} copy link={getExplorerUrl(address)} />
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
          <Row
            address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'}
            title="Bridge Proxy Contract"
          />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="Governor Multisig" />
          <Row
            address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'}
            title="Bridge Proxy Contract"
          />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="DAI Token" />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="Compound protocol" />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="COMP Token" />
        </Rows>
      </Card>
    </Column>
    <Column>
      <Title>Omnibridge bridge configuration</Title>
      <Card>
        <SubTitle>Ethereum Addresses</SubTitle>
        <Rows>
          <Row
            address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'}
            title="Omnibridge Mediator Proxy"
          />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="Governor Multisig" />
          <Row
            address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'}
            title="Aave Interest Module"
          />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="USDC Token" />
          <Row address={'0x32dea44d5C243990B0133f5D103C2A784aA6a29F'} title="USDT Token" />
        </Rows>
      </Card>
    </Column>
  </Wrapper>
)
