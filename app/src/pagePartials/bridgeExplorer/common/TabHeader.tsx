import styled, { css } from 'styled-components'

const Wrapper = styled.button<{ isActive: boolean }>`
  background-color: transparent;
  border-bottom-color: ${({ theme }) => theme.colors.darkerGrey};
  border-left-color: transparent;
  border-right-color: transparent;
  border-style: solid;
  border-top-color: transparent;
  border-width: 1px;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: block;
  margin-bottom: -1px;
  padding: ${({ theme: { common } }) => common.space * 4}px;

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.black};

    .tabTitle {
      opacity: 1;
    }

    &:active {
      .tabTitle {
        transition: none;
        opacity: 0.75;
      }
    }
  }

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: ${({ theme: { colors } }) => colors.darkestGrey};
      border-bottom-color: ${({ theme: { colors } }) => colors.darkestGrey};
      border-left-color: ${({ theme: { colors } }) => colors.darkerGrey};
      border-right-color: ${({ theme: { colors } }) => colors.darkerGrey};
      color: ${({ theme: { colors } }) => colors.white};
      cursor: default;
      opacity: 1;
      pointer-events: none;

      &:hover {
        background-color: ${({ theme: { colors } }) => colors.darkestGrey};
      }

      &:first-child {
        border-left-color: transparent;
      }

      .tabTitle {
        opacity: 1;
      }
    `}

  &[disabled] {
    cursor: not-allowed;
  }
`

const Title = styled.span`
  color: #fff;
  font-size: 1.6rem;
  font-weight: 400;
  opacity: 0.5;
  transition: opacity 0.15s ease-in-out;
`

Title.defaultProps = {
  className: 'tabTitle',
}

interface Props {
  disabled?: boolean
  onClick?: () => void
  title: string
  isActive: boolean
}

export const TabHeader: React.FC<Props> = ({ disabled, isActive, onClick, title }) => {
  const handleActive = () => onClick && onClick()

  return (
    <Wrapper disabled={disabled} isActive={isActive} onClick={handleActive}>
      {/* TODO: Get title from a non-hardcoded way */}
      <Title>{title === 'AMB' ? 'Omnibridge' : title}</Title>
    </Wrapper>
  )
}
