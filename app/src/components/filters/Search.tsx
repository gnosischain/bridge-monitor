import styled from 'styled-components'

export const Search = styled.div`
  background: ${({ theme: { colors } }) => colors.darkerGrey};
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  overflow: hidden;
  position: relative;
  .icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${({ theme: { common } }) => common.space * 2}px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
