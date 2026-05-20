import { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled, { css } from 'styled-components'

import { Close as BaseClose } from '@/src/components/assets/Close'
import { BaseCard } from '@/src/components/card/BaseCard'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { modal } }) => modal.overlayColor};
  display: flex;
  flex-direction: column;
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;
  overflow: auto;
`

const Card = styled(BaseCard)<{ size?: modalSize }>`
  background-color: ${({ theme: { colors } }) => colors.creamLight};
  border: 0;
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 100%;
  padding: 0;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  position: relative;
  width: ${({ size }) =>
    size === 'sm' ? '325px' : size === 'md' ? '500px' : size === 'lg' ? '720px' : `${size}`};
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 20px 0 20px;
  text-align: center;
  width: 100%;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 10;
`
const Close = styled(BaseClose)`
  &:active,
  &:hover {
    opacity: 0.7;
  }
`

const Contents = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`

export const ModalTextCSS = css`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 auto 20px;
  text-align: center;

  &:last-child {
    margin-bottom: 0;
  }
`

export const ModalText = styled.p`
  ${ModalTextCSS}
`

export const ModalLine = styled.div`
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  height: 1px;
  margin: 0 auto 20px;
  width: 180px;
`

export type modalSize = 'sm' | 'md' | 'lg' | string

interface Props extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  size?: modalSize
  title?: string
}

export const Modal: React.FC<Props> = ({
  children,
  onClose,
  size = 'md',
  title,
  ...restProps
}: Props) => {
  const portal = document.getElementById('modals') as HTMLElement
  const validOnClose = onClose && typeof onClose === 'function'

  const close = () => {
    if (validOnClose) {
      onClose()
    }
  }

  return (
    portal &&
    ReactDOM.createPortal(
      <Wrapper className="modal" onClick={close} {...restProps}>
        <Card
          className="modalCard"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
          size={size}
        >
          {title && <Title>{title}</Title>}
          <CloseButton onClick={close}>
            <Close height={12} width={12} />
          </CloseButton>
          <Contents>{children}</Contents>
        </Card>
      </Wrapper>,
      portal,
    )
  )
}
