import { HTMLAttributes, useEffect, useId } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { Close as BaseClose } from '@/src/components/assets/Close'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { modal } }) => modal.overlayColor};
  display: flex;
  flex-direction: column;
  height: 100vh;
  left: 0;
  overflow: auto;
  padding: var(--theme-common-space);
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;
`

const Card = styled.div<{ size?: modalSize }>`
  background-color: ${({ theme: { colors } }) => colors.surface};
  border-radius: ${({ theme: { common } }) => common.borderRadiusBigger};
  box-shadow: ${({ theme: { common } }) => common.shadow};
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 100%;
  overflow: hidden;
  position: relative;
  width: ${({ size }) =>
    size === 'sm' ? '360px' : size === 'md' ? '520px' : size === 'lg' ? '720px' : `${size}`};
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 7)
    calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);
`

const CloseButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: calc(var(--theme-common-space) * 1.5);
  top: calc(var(--theme-common-space) * 1.5);
  width: 36px;
  z-index: 10;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.page};
  }
`

const Close = styled(BaseClose)`
  .fill {
    fill: ${({ theme: { colors } }) => colors.fog};
  }
`

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
  const titleId = useId()
  const validOnClose = onClose && typeof onClose === 'function'

  const close = () => {
    if (validOnClose) {
      onClose()
    }
  }

  useEffect(() => {
    if (!validOnClose) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, validOnClose])

  return (
    portal &&
    ReactDOM.createPortal(
      <Wrapper className="modal" onClick={close} {...restProps}>
        <Card
          aria-labelledby={title ? titleId : undefined}
          aria-modal="true"
          className="modalCard"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
          role="dialog"
          size={size}
        >
          {title && <Title id={titleId}>{title}</Title>}
          <CloseButton aria-label="Close" onClick={close} type="button">
            <Close height={12} width={12} />
          </CloseButton>
          <Contents>{children}</Contents>
        </Card>
      </Wrapper>,
      portal,
    )
  )
}
