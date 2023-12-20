import styled from 'styled-components'

export const InnerCard = styled.div`
  background: ${({ theme: { colors } }) => colors.darkerGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  box-shadow: 0 100px 80px rgba(0, 0, 0, 0.2), 0px 38.5185px 25.4815px rgba(0, 0, 0, 0.121481),
    0 8.14815px 6.51852px rgba(0, 0, 0, 0.0785185);
  column-gap: calc(var(--theme-common-space) * 2);
  display: flex;
  flex-direction: column;
  padding: calc(var(--theme-common-space) * 3) calc(var(--theme-common-space) * 2);
  row-gap: calc(var(--theme-common-space) * 2);
`
