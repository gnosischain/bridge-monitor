import React from 'react'
import styled from 'styled-components'

import { GnosisChainLogo } from '@/src/components/assets/GnosisChainLogo'
import { MainCard } from '@/src/components/card/MainCard'

const Wrapper = styled(MainCard)`
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  padding-bottom: calc(var(--theme-common-space) * 5);
  row-gap: calc(var(--theme-common-space) * 5);
  width: 100%;
  z-index: 300;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    max-width: 400px;
  }
`

const Icon = styled.div`
  display: flex;
  justify-content: center;
`

const MainLogo = styled(GnosisChainLogo)`
  --size: 30px;

  animation-iteration-count: infinite;
  height: var(--size);
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  text-align: center;
  word-break: break-word;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 2.8rem;
  }
`

const MessageWrapper = styled.div`
  max-height: 250px;
  overflow: auto;
  position: relative;
`

const Text = styled.div`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.textColor};
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.5;
  row-gap: calc(var(--theme-common-space) * 3);
  text-align: center;
  width: 100%;
  word-break: break-word;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 1.8rem;
  }

  a {
    color: ${({ theme: { colors } }) => colors.textColor};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

export const GenericError: React.FC<{
  title?: string
  text?: string | React.ReactNode
  icon?: React.ReactNode
}> = ({ icon = <MainLogo />, text = 'Something went wrong.', title = 'Error', ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      <MessageWrapper>
        <Text>{text}</Text>
      </MessageWrapper>
    </Wrapper>
  )
}
