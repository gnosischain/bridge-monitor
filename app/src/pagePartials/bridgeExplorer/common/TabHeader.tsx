import styled, { css } from 'styled-components'

const Wrapper = styled.button<{ $isActive: boolean }>`
  background-color: transparent;
  border-bottom-color: ${({ theme: { colors } }) => colors.cream};
  border-left-color: transparent;
  border-right-color: transparent;
  border-style: solid;
  border-top-color: transparent;
  border-width: 1px;
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  display: block;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  margin-bottom: -1px;
  padding: calc(var(--theme-common-space) * 2) calc(var(--theme-common-space) * 3);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    padding: calc(var(--theme-common-space) * 3);
  }

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    padding: calc(var(--theme-common-space) * 4);
  }

  &:first-child {
    border-top-left-radius: var(--mains-tab-wrapper-border-radius);
  }

  &:last-child {
    border-top-right-radius: var(--mains-tab-wrapper-border-radius);
  }

  &:hover {
    background-color: ${({ theme: { colors } }) => colors.creamDark};

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

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: ${({ theme: { colors } }) => colors.cream};
      border-bottom-color: ${({ theme: { colors } }) => colors.cream};
      border-left-color: ${({ theme: { colors } }) => colors.cream};
      border-right-color: ${({ theme: { colors } }) => colors.cream};
      color: ${({ theme: { colors } }) => colors.primary};
      cursor: default;
      opacity: 1;
      pointer-events: none;

      &:hover {
        background-color: ${({ theme: { colors } }) => colors.cream};
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
  font-size: 1.8rem;
  font-weight: 500;
  opacity: 0.8;
  transition: opacity 0.15s ease-in-out;
`

Title.defaultProps = {
  className: 'tabTitle',
}

interface Props {
  disabled?: boolean
  onClick?: () => void
  title: string
  $isActive: boolean
}

export const TabHeader: React.FC<Props> = ({ $isActive, disabled, onClick, title }) => {
  const handleActive = () => onClick && onClick()

  return (
    <Wrapper $isActive={$isActive} disabled={disabled} onClick={handleActive}>
      {/* TODO: Get title from a non-hardcoded way */}
      <Title>{title === 'AMB' ? 'Omnibridge' : title}</Title>
    </Wrapper>
  )
}
