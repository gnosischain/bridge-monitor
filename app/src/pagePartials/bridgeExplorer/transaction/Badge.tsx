import styled from 'styled-components'

const Wrapper = styled.div`
  --height: 24px;

  align-items: center;
  background: ${({ theme: { colors } }) => colors.creamLight};
  border-radius: 6px;
  color: ${({ theme: { colors } }) => colors.primary};
  display: flex;
  font-size: 1.4rem;
  font-weight: 400;
  height: var(--height);
  justify-content: center;
  line-height: var(--height);
  padding: 0 var(--theme-common-space);
`

Wrapper.defaultProps = {
  className: 'badge',
}

interface Props {
  text: string
}

export const Badge: React.FC<Props> = ({ text, ...restProps }) => {
  return <Wrapper {...restProps}>{text}</Wrapper>
}
