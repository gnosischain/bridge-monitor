import styled, { css } from 'styled-components'
import { ChevronDown } from '@/src/components/assets/ChevronDown'

const Wrapper = styled.button<{ isOpen: boolean }>`
  align-items: center;
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  display: flex;
  font-size: 1.4rem;
  font-weight: 500;
  gap: var(--theme-common-space);
  line-height: 1;
  margin-left: auto;
  padding: var(--theme-common-space);
  text-align: right;

  svg {
    width: 12px;

    ${({ isOpen }) =>
      isOpen &&
      css`
        transform: rotate(180deg);
      `}
  }
`

Wrapper.defaultProps = {
  type: 'button',
}

export const SendToDifferentWallet: React.FC<{ isOpen: boolean; onClick: () => void }> = ({
  isOpen,
  onClick,
  ...restProps
}) => (
  <Wrapper isOpen={isOpen} onClick={onClick} {...restProps}>
    Send to a different wallet <ChevronDown />
  </Wrapper>
)
