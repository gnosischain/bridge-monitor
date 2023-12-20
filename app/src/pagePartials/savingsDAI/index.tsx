import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
`

export const SavingsDAIIndex: React.FC = ({ ...restProps }) => {
  return <Wrapper {...restProps}>Savings DAI content goes here.</Wrapper>
}
