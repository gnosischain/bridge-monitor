import styled from 'styled-components'
import { SwitcherArrows } from '@/src/components/assets/SwitcherArrows'

const Wrapper = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: 50%;
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  bottom: 0;
  box-shadow: 0 2.231px 2.775px 0 rgba(0, 0, 0, 0.01), 0 10.2px 7.8px 0 rgba(0, 0, 0, 0.01),
    0 25.819px 20.925px 0 rgba(0, 0, 0, 0.02), 0 51px 48px 0 rgba(0, 0, 0, 0.03);
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  display: flex;
  height: 50px;
  justify-content: center;
  left: 0;
  margin: 4px auto 0;
  position: absolute;
  right: 0;
  transform: translateY(29px);
  transition: none;
  width: 50px;

  &:hover {
    color: ${({ theme: { colors } }) => colors.primaryLight};
  }

  &:active {
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.005), 0 5px 4px 0 rgba(0, 0, 0, 0.005),
      0 12px 10px 0 rgba(0, 0, 0, 0.01), 0 15px 15px 0 rgba(0, 0, 0, 0.01);
    opacity: 0.9;
  }
`

export const Switch: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Wrapper onClick={onClick} type="button">
    <SwitcherArrows />
  </Wrapper>
)
