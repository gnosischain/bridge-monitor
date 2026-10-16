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
  background-color: ${({ theme: { toast } }) => toast.backgroundColor};
  border: 1px solid ${({ theme: { toast } }) => toast.borderColor};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBig};
  box-shadow: ${({ theme: { toast } }) => toast.boxShadow};
  max-width: 360px;
  min-width: ${({ autoWidth }) => (autoWidth ? '0' : '260px')};
  padding: calc(var(--theme-common-space) * 1.75) calc(var(--theme-common-space) * 5)
    calc(var(--theme-common-space) * 1.75) calc(var(--theme-common-space) * 1.75);
  position: relative;

  ${({ type }) =>
    type === ToastStates.failed &&
    css`
      background-color: ${({ theme: { colors } }) => colors.errorSoft};
      border-color: ${({ theme: { colors } }) => colors.errorSoft};
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
          grid-template-columns: 28px 1fr;
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
  justify-content: center;

  svg {
    height: 24px;
    width: 24px;
  }
`

const TextContainer = styled.div`
  min-width: 0;
  word-break: break-word;
`

const Title = styled.h4`
  color: ${({ theme: { colors } }) => colors.ink};
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 2px 0 2px;
`

const Text = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.3rem;
  line-height: 1.5;
  margin: 0 0 var(--theme-common-space);

  &:last-child {
    margin-bottom: 0;
  }
`

const Link = styled.a`
  color: ${({ theme: { colors } }) => colors.violet};
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Code = styled.blockquote`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border: 1px solid ${({ theme: { colors } }) => colors.line};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  color: ${({ theme: { colors } }) => colors.fog};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  font-size: 1.2rem;
  line-height: 1.5;
  margin: var(--theme-common-space) 0 0;
  padding: 6px 10px;

  &:active {
    opacity: 0.8;
  }
`

const ClickToCopy = styled.span`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.violet};
  column-gap: 5px;
  cursor: pointer;
  display: flex;
  font-weight: 600;
  justify-content: flex-end;
  margin-top: 6px;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    opacity: 0.8;
  }
`

const ButtonClose = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  margin: 0;
  padding: 0;
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  z-index: 5;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.page};
  }

  .fill {
    fill: ${({ theme: { colors } }) => colors.fog};
  }
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
              <Code onClick={(e: React.MouseEvent) => copy(e, message)}>
                <div>{message.slice(0, maxLength)}[...]</div>
              </Code>
              <Text>
                <ClickToCopy onClick={(e: React.MouseEvent) => copy(e, message)}>
                  Click to copy
                  <IconCopy />
                </ClickToCopy>
              </Text>
            </>
          ) : (
            message && <Text>{message}</Text>
          )}
          {link && (
            <Link href={link.url} rel="noreferrer" target="_blank">
              {link.text}
            </Link>
          )}
        </TextContainer>
      </Contents>
      <ButtonClose aria-label="Dismiss" onClick={() => toast.remove(t.id)} type="button">
        <Close />
      </ButtonClose>
    </Wrapper>
  )
}
