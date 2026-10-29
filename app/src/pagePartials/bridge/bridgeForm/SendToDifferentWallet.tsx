import styled, { css } from 'styled-components'
import { ChevronDown } from '@/src/components/assets/ChevronDown'

const Wrapper = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})<{ isOpen: boolean }>`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 999px;
  color: ${({ theme: { colors } }) => colors.fog};
  cursor: pointer;
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  gap: 6px;
  line-height: 1;
  margin-left: auto;
  padding: 6px 0;
  text-align: right;

  &:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }

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
