import styled from 'styled-components'
import { SwitcherArrows } from '@/src/components/assets/SwitcherArrows'

const Wrapper = styled.button`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.white};
  border-radius: 50%;
  border: 1px solid ${({ theme: { colors } }) => colors.cream};
  bottom: 0;
  box-shadow: 0px 2.231px 2.775px 0px rgba(0, 0, 0, 0.01), 0px 10.2px 7.8px 0px rgba(0, 0, 0, 0.01),
    0px 25.819px 20.925px 0px rgba(0, 0, 0, 0.02), 0px 51px 48px 0px rgba(0, 0, 0, 0.03);
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
  width: 50px;

  &:hover {
    color: ${({ theme: { colors } }) => colors.primaryLight};
  }
`

export const Switch: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Wrapper onClick={onClick} type="button">
    <SwitcherArrows />
  </Wrapper>
)
