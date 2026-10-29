import styled from 'styled-components'
import { SwitcherArrows } from '@/src/components/assets/SwitcherArrows'

// Sits on the gap between the two panels. The white ring matches the form card, so the button
// looks cut out of both panels.
const Wrapper = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.page};
  border-radius: 50%;
  border: 4px solid ${({ theme: { colors } }) => colors.surface};
  bottom: 0;
  color: ${({ theme: { colors } }) => colors.ink};
  cursor: pointer;
  display: flex;
  height: 44px;
  justify-content: center;
  left: 50%;
  padding: 0;
  position: absolute;
  transform: translate(-50%, calc(50% + var(--theme-common-space) / 2));
  transition: background-color 0.15s linear;
  width: 44px;
  z-index: 2;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.lilac};
  }

  &:active {
    opacity: 0.8;
  }
`

export const Switch: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Wrapper aria-label="Switch direction" onClick={onClick} type="button">
    <SwitcherArrows />
  </Wrapper>
)
