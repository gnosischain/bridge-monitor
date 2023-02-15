import styled from 'styled-components'

export const InnerCard = styled.div`
  background: ${({ theme: { colors } }) => colors.darkerGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  box-shadow: 0 100px 80px rgba(0, 0, 0, 0.2), 0px 38.5185px 25.4815px rgba(0, 0, 0, 0.121481),
    0 8.14815px 6.51852px rgba(0, 0, 0, 0.0785185);
  column-gap: ${({ theme: { common } }) => common.space * 2}px;
  display: flex;
  flex-direction: column;
  padding: ${({ theme: { common } }) => common.space * 3}px
    ${({ theme: { common } }) => common.space * 2}px;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
`
