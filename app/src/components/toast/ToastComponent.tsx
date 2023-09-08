import { ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { Toast, toast } from 'react-hot-toast'

import { Close } from '@/src/components/assets/Close'

const loadingAnimation = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`

const Wrapper = styled.div`
  animation-delay: 0;
  animation-duration: 0.25s;
  animation-iteration-count: 1;
  animation-name: ${loadingAnimation};
  animation-timing-function: ease-in-out;
  background-color: ${({ theme: { toast } }) => toast.backgroundColor};
  border-color: ${({ theme: { toast } }) => toast.borderColor};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border-style: none;
  border-width: 0;
  box-shadow: ${({ theme: { toast } }) => toast.boxShadow};
  column-gap: 10px;
  display: flex;
  max-width: 350px;
  min-width: 200px;
  padding: 10px 15px;
  position: relative;
`

const IconContainer = styled.div`
  align-items: center;
  display: flex;
  height: var(--toast-icon-dimensions);
  justify-content: center;
`

const TextContainer = styled.div`
  word-break: break-word;
`

const Title = styled.h4`
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
`

const TextCSS = css`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.5rem;
  line-height: 1.4;
`

const Text = styled.p`
  ${TextCSS}
  margin: 0 0 10px;

  &:last-child {
    margin-bottom: 0;
  }
`

const Link = styled.a`
  ${TextCSS}
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const ButtonClose = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  margin: 0;
  outline: none;
  padding: 0;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 5;
`

export const ToastComponent: React.FC<{
  icon?: ReactNode
  link?: {
    url: string
    text: string
  }
  message?: string
  t: Toast
  title?: string
}> = ({ icon, link, message, t, title }) => (
  <Wrapper>
    {icon && <IconContainer>{icon}</IconContainer>}
    <TextContainer>
      {title && <Title>{title}</Title>}
      {message && <Text>{message}</Text>}
      {link && (
        <Link href={link.url} rel="noreferrer" target="_blank">
          {link.text}
        </Link>
      )}
    </TextContainer>
    <ButtonClose onClick={() => toast.remove(t.id)}>
      <Close />
    </ButtonClose>
  </Wrapper>
)
