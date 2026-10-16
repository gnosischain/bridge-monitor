import React from 'react'
import styled from 'styled-components'

import { Alert } from '@/src/components/assets/Alert'

// No card of its own: the bridging status shows it inside its card; standalone callers wrap it.
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 480px;
  padding: calc(var(--theme-common-space) * 3) 0;
  row-gap: calc(var(--theme-common-space) * 2);
  text-align: center;
  width: 100%;
`

const Icon = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.errorSoft};
  border-radius: 50%;
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;

  svg {
    height: 28px;
    width: 28px;
  }
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  word-break: break-word;
`

const MessageWrapper = styled.div`
  max-height: 250px;
  overflow: auto;
  position: relative;
  width: 100%;
`

// Flowing text, so a link inside a sentence stays inline.
const Text = styled.div`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.6;
  width: 100%;
  word-break: break-word;

  a {
    color: ${({ theme: { colors } }) => colors.violet};
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      text-decoration: none;
    }
  }

  b {
    color: ${({ theme: { colors } }) => colors.ink};
    font-weight: 600;
  }
`

export const GenericError: React.FC<{
  title?: string
  text?: string | React.ReactNode
  icon?: React.ReactNode
}> = ({ icon = <Alert />, text = 'Something went wrong.', title = 'Error', ...restProps }) => {
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
