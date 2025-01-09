import { ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { Toast, toast } from 'react-hot-toast'
import { ToastStates } from '@/src/constants/types'
import { IconCopy } from '@/src/components/assets/IconCopy'
import { Close } from '@/src/components/assets/Close'
import { useCopyToast } from '@/src/hooks/useCopyToast'

const loadingAnimation = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`

const Wrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['type', 'autoWidth'].includes(prop),
})<{ type?: ToastStates; autoWidth?: boolean }>`
  animation-delay: 0;
  animation-duration: 0.25s;
  animation-iteration-count: 1;
  animation-name: ${loadingAnimation};
  animation-timing-function: ease-in-out;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border-style: none;
  border-width: 0;
  box-shadow: ${({ theme: { toast } }) => toast.boxShadow};
  max-width: 350px;
  min-width: ${({ autoWidth }) => (autoWidth ? '0' : '200px')};
  padding: var(--theme-common-space) calc(var(--theme-common-space) * 3) var(--theme-common-space)
    var(--theme-common-space);
  position: relative;

  ${({ type }) =>
    (type === ToastStates.waiting || type === ToastStates.success) &&
    css`
      background-color: ${({ theme: { toast } }) => toast.backgroundColor};
      border-color: ${({ theme: { toast } }) => toast.borderColor};
    `}

  ${({ type }) =>
    type === ToastStates.failed &&
    css`
      background-color: ${({ theme: { colors } }) => colors.creamDark};
      border-color: ${({ theme: { colors } }) => colors.creamDark};
    `}
`

Wrapper.defaultProps = {
  type: ToastStates.waiting,
}

const Contents = styled.div<{ display: 'grid' | 'flex' }>`
  column-gap: 12px;

  ${({ display }) =>
    display === 'grid'
      ? css`
          display: grid;
          grid-template-columns: 25px 1fr;
        `
      : css`
          display: flex;
        `}
`

Contents.defaultProps = {
  display: 'flex',
}

const IconContainer = styled.div`
  align-items: flex-start;
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
  margin: 0 0 3px;
`

const TextCSS = css`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.4rem;
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

const Code = styled.blockquote`
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: #222;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  font-style: italic;
  line-height: 1.4;
  padding: 6px 10px;
  margin: 0;

  &:active {
    opacity: 0.8;
  }
`

const ClickToCopy = styled.span`
  align-items: center;
  column-gap: 5px;
  cursor: pointer;
  display: flex;
  font-weight: 700;
  justify-content: flex-end;
  margin-top: 6px;
  text-decoration: underline;

  &:active {
    opacity: 0.8;
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
  right: 7px;
  top: 5px;
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
  type?: ToastStates
  autoWidth?: boolean
}> = ({ autoWidth, icon, link, message, t, title, type, ...restProps }) => {
  const maxLength = 120
  const messageTooLong = message && message.length > maxLength
  const { copy } = useCopyToast()

  return (
    <Wrapper autoWidth={autoWidth} type={type} {...restProps}>
      <Contents display={icon ? 'grid' : 'flex'}>
        {icon && <IconContainer>{icon}</IconContainer>}
        <TextContainer>
          {title && <Title>{title}</Title>}
          {message && messageTooLong ? (
            <>
              <Code onClick={(e) => copy(e, message)}>
                <div>{message.slice(0, maxLength)}[...]</div>
              </Code>
              <Text>
                <ClickToCopy onClick={(e) => copy(e, message)}>
                  Click to copy
                  <IconCopy />
                </ClickToCopy>
              </Text>
            </>
          ) : (
            <Text>{message}</Text>
          )}
          {link && (
            <Link href={link.url} rel="noreferrer" target="_blank">
              {link.text}
            </Link>
          )}
        </TextContainer>
      </Contents>
      <ButtonClose onClick={() => toast.remove(t.id)}>
        <Close />
      </ButtonClose>
    </Wrapper>
  )
}
