import styled from 'styled-components'
import { MainCard } from '@/src/components/card/MainCard'
import { ArrowLeft } from '@/src/components/assets/ArrowLeft'
import { MainTitle } from '@/src/components/text/MainTitle'
import Link from 'next/link'
import { Ok } from '@/src/components/assets/Ok'
import { LinkFullPrimary } from '@/src/components/buttons/Button'
import { BlockConfirmations } from '@/src/pagePartials/bridge/BlockConfirmations'
import { transactionBaseURL } from '@/src/constants/sections'

const Wrapper = styled(MainCard)`
  align-items: center;
  padding-top: calc(var(--theme-common-space) * 5);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding-top: calc(var(--theme-common-space) * 8);
  }
`

const InnerWrapper = styled.div`
  max-width: 100%;
  width: 100%;
  max-width: 644px;
`

const Header = styled.div`
  align-items: center;
  display: flex;
  column-gap: calc(var(--theme-common-space) * 2);
  width: 100%;
`

const HeaderInner = styled.div`
  display: flex;
  flex-direction: row;
  row-gap: var(--theme-common-space);
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme: { colors } }) => colors.darkGreen};
  color: ${({ theme: { colors } }) => colors.cream};
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 2)
    calc(var(--theme-common-space) * 4);
  border-radius: 16px 16px 0px 0px;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 4);
  }
`

const BackLink = styled.a`
  color: ${({ theme: { colors } }) => colors.cream};
  &:hover {
    color: ${({ theme: { colors } }) => colors.white};
  }
`
const MessageWrapper = styled.div`
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: 16px;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 1);
  margin-top: calc(var(--theme-common-space) * -2);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 3);
  }
`
const Message = styled.div`
  display: flex;
  gap: calc(var(--theme-common-space) * 2);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: calc(var(--theme-common-space) * 4) 0;
`
const Icon = styled.div`
  border-radius: 50%;
  height: 80px;
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme: { colors } }) => colors.creamDark};
`
const StatusTitle = styled.h2`
  margin: 0;
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 100%;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 2.8rem;
  }
`
const MessageText = styled.p`
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  max-width: 418px;
  text-align: center;
  margin: 0;
  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.8rem;
  }
`

export const Success: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <InnerWrapper>
        <Header>
          <HeaderInner>
            <MainTitle>Bridge</MainTitle>
            <Link href="/" passHref>
              <BackLink>
                <ArrowLeft />
              </BackLink>
            </Link>
          </HeaderInner>
        </Header>
        <MessageWrapper>
          <Message>
            <Icon>
              <Ok />
            </Icon>
            <StatusTitle>Bridge initiated</StatusTitle>
            <MessageText>
              {/*TODO: Replace with real data */}
              Waiting for confirmation. <br />
              Sending 500 xDAI to Gnosis Chain.
            </MessageText>
          </Message>
          {/*TODO: Replace with real data */}
          <BlockConfirmations
            address="0x0635a3731fcbf6aeeb3370814f5dcaa1b83b6dd26ecf433c81ac7838b6c43bea"
            percentage={80}
            time="30 min"
          />
          {/*TODO: Replace with real link */}
          <Link
            href={`${transactionBaseURL}/0x0635a3731fcbf6aeeb3370814f5dcaa1b83b6dd26ecf433c81ac7838b6c43bea`}
            passHref
          >
            <LinkFullPrimary>Explore transaction</LinkFullPrimary>
          </Link>
        </MessageWrapper>
      </InnerWrapper>
    </Wrapper>
  )
}
