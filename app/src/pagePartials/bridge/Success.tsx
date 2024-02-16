import styled from 'styled-components'
import { ArrowLeft } from '@/src/components/assets/ArrowLeft'
import { MainTitle } from '@/src/components/text/MainTitle'
import Link from 'next/link'
import { Ok } from '@/src/components/assets/Ok'
import { ButtonFull } from '@/src/components/buttons/Button'
import { BlockConfirmations } from '@/src/pagePartials/common/BlockConfirmations'
import { transactionBaseURL } from '@/src/constants/sections'

const Wrapper = styled.div`
  max-width: 644px;
  width: 100%;
`

const Header = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGreen};
  border-radius: 16px 16px 0 0;
  color: ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  justify-content: space-between;
  padding: calc(var(--theme-common-space) * 2);
  row-gap: var(--theme-common-space);
  width: 100%;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
  }
`

const GoBack = styled.span`
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
`

const Contents = styled.div`
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 1);
  position: relative;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    padding: calc(var(--theme-common-space) * 4) calc(var(--theme-common-space) * 3)
      calc(var(--theme-common-space) * 3);
  }
`

const Inner = styled.div`
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
  padding: calc(var(--theme-common-space) * 3);
`

const Message = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
  justify-content: center;
  padding: calc(var(--theme-common-space) * 6) 0 calc(var(--theme-common-space) * 4);
`

const Icon = styled.div`
  --size: 80px;

  align-items: center;
  border-radius: 50%;
  border: 1px solid ${({ theme: { colors } }) => colors.creamDark};
  display: flex;
  height: var(--size);
  justify-content: center;
  width: var(--size);
`

const StatusTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 100%;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 2.8rem;
  }
`

const MessageText = styled.p`
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  max-width: 418px;
  text-align: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 1.8rem;
  }
`

export const Success: React.FC<{ onGoBack: () => void }> = ({ onGoBack, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Header>
        <MainTitle>Bridge</MainTitle>
        <GoBack onClick={onGoBack}>
          <ArrowLeft />
        </GoBack>
      </Header>
      <Contents>
        <Inner>
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
            <ButtonFull as="a">Explore transaction</ButtonFull>
          </Link>
        </Inner>
      </Contents>
    </Wrapper>
  )
}
