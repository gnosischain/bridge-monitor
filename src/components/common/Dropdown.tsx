import {
  DOMAttributes,
  HTMLAttributes,
  cloneElement,
  createRef,
  useCallback,
  useEffect,
  useState,
} from 'react'
import styled, { css } from 'styled-components'

export enum DropdownPosition {
  center,
  left,
  right,
}

export enum DropdownDirection {
  downwards = 'down',
  upwards = 'up',
}

interface WrapperProps {
  disabled: boolean
  fullWidth?: boolean
  isOpen: boolean
}

const Wrapper = styled.div<WrapperProps>`
  outline: none;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  position: relative;
  z-index: ${(props) => (props.isOpen ? '50' : '0')};

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

Wrapper.defaultProps = {
  fullWidth: false,
}

const ButtonContainer = styled.div`
  background-color: transparent;
  border: none;
  display: block;
  outline: none;
  padding: 0;
  user-select: none;
  width: 100%;
`

const PositionLeftCSS = css`
  left: 0;
`

const PositionRightCSS = css`
  right: 0;
`

const PositionCenterCSS = css`
  left: 50%;
  transform: translateX(-50%);
`

const DirectionDownwardsCSS = css`
  top: calc(100% + 10px);
`

const DirectionUpwardsCSS = css`
  bottom: calc(100%);
`

interface ItemProps {
  dropdownDirection?: DropdownDirection
  dropdownPosition?: DropdownPosition
  isOpen: boolean
}

const Items = styled.div<ItemProps>`
  background-color: ${({ theme }) => theme.dropdown.background};
  border-radius: ${({ theme }) => theme.dropdown.borderRadius};
  border: 1px solid ${({ theme }) => theme.dropdown.borderColor};
  box-shadow: ${({ theme }) => theme.dropdown.boxShadow};
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  min-width: 150px;
  position: absolute;
  white-space: nowrap;

  ${(props) => (props.dropdownPosition === DropdownPosition.left ? PositionLeftCSS : '')}
  ${(props) => (props.dropdownPosition === DropdownPosition.right ? PositionRightCSS : '')}
  ${(props) => (props.dropdownPosition === DropdownPosition.center ? PositionCenterCSS : '')}
  ${(props) =>
    props.dropdownDirection === DropdownDirection.downwards ? DirectionDownwardsCSS : ''}
  ${(props) => (props.dropdownDirection === DropdownDirection.upwards ? DirectionUpwardsCSS : '')}
`

Items.defaultProps = {
  dropdownDirection: DropdownDirection.downwards,
  dropdownPosition: DropdownPosition.left,
  isOpen: false,
}

export interface DropdownItemProps {
  closeOnClick?: boolean
  disabled?: boolean
  justifyContent?: string
}

export const DropdownItemCSS = css<DropdownItemProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.dropdown.item.backgroundColor};
  border-bottom: 1px solid ${({ theme }) => theme.dropdown.item.borderColor};
  color: ${({ theme }) => theme.dropdown.item.color};
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  gap: 10px;
  justify-content: ${({ justifyContent }) => justifyContent};
  line-height: 1.4;
  min-height: 36px;
  overflow: hidden;
  padding: 0 20px;
  text-decoration: none;
  transition: background-color 0.15s linear;
  user-select: none;
  white-space: normal;

  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.dropdown.borderRadius};
    border-top-right-radius: ${({ theme }) => theme.dropdown.borderRadius};
  }

  &:last-child {
    border-bottom-left-radius: ${({ theme }) => theme.dropdown.borderRadius};
    border-bottom-right-radius: ${({ theme }) => theme.dropdown.borderRadius};
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.dropdown.item.backgroundColorHover};
  }

  &:disabled,
  &[disabled] {
    &,
    &:hover {
      background-color: ${({ theme }) => theme.dropdown.item.backgroundColor};
      cursor: not-allowed;
      font-weight: 400;
      opacity: 0.5;
      pointer-events: none;
    }
  }
`

export const DropdownItem = styled.div<DropdownItemProps>`
  ${DropdownItemCSS}
`

DropdownItem.defaultProps = {
  closeOnClick: true,
  disabled: false,
  justifyContent: 'flex-start',
}

interface Props extends DOMAttributes<HTMLDivElement>, HTMLAttributes<HTMLDivElement> {
  activeItemHighlight?: boolean | undefined
  className?: string
  disabled?: boolean
  dropdownButton?: React.ReactNode | string
  dropdownDirection?: DropdownDirection | undefined
  dropdownPosition?: DropdownPosition | undefined
  fullWidth?: boolean
  items: Array<unknown>
}

export const Dropdown: React.FC<Props> = (props) => {
  const {
    className = '',
    disabled = false,
    dropdownButton,
    dropdownDirection,
    dropdownPosition,
    fullWidth,
    items,
    ...restProps
  } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const node = createRef<HTMLDivElement>()

  const onButtonClick = useCallback(
    (e) => {
      e.stopPropagation()

      if (disabled) {
        return
      }

      setIsOpen(!isOpen)
    },
    [disabled, isOpen],
  )

  useEffect(() => {
    // Note: This code handles closing when clicking outside of the dropdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (e: any) => {
      if (node && node.current && node.current.contains(e.target)) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [node])

  return (
    <Wrapper
      className={`dropdown ${isOpen ? 'isOpen' : ''} ${className}`}
      disabled={disabled}
      fullWidth={fullWidth}
      isOpen={isOpen}
      ref={node}
      {...restProps}
    >
      <ButtonContainer className="dropdownButton" onClick={onButtonClick}>
        {dropdownButton}
      </ButtonContainer>
      <Items
        className="dropdownItems"
        dropdownDirection={dropdownDirection}
        dropdownPosition={dropdownPosition}
        isOpen={isOpen}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items.map((item: any, index: number) => {
            const dropdownItem = cloneElement(item, {
              className: `dropdownItem`,
              key: item.key ? item.key : index,
              onClick: (e) => {
                e.stopPropagation()

                if (item.props.closeOnClick) {
                  setIsOpen(false)
                }

                if (!item.props.onClick) {
                  return
                }

                item.props.onClick()
              },
            })

            return dropdownItem
          })
        }
      </Items>
    </Wrapper>
  )
}
