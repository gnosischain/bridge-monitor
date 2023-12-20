import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding: 20px;
  border-radius: 10px;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  justify-content: center;
`

export const BridgeIndex: React.FC = ({ ...restProps }) => {
  return <Wrapper {...restProps}>Bridge content goes here.</Wrapper>
}
