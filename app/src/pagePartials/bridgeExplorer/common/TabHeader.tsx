import styled, { css } from 'styled-components'

const Wrapper = styled.button<{ $isActive: boolean }>`
  align-items: center;
  background-color: transparent;
  border-radius: 999px;
  border: none;
  color: ${({ theme: { colors } }) => colors.fog};
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  height: 36px;
  padding: 0 calc(var(--theme-common-space) * 2);
  transition:
    background-color 0.15s linear,
    color 0.15s linear;
  white-space: nowrap;

  &:hover {
    color: ${({ theme: { colors } }) => colors.ink};
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: ${({ theme: { colors } }) => colors.surface};
      box-shadow: 0 1px 2px rgba(7, 5, 44, 0.12);
      color: ${({ theme: { colors } }) => colors.ink};
      cursor: default;
      pointer-events: none;
    `}

  &[disabled] {
    cursor: not-allowed;
  }
`

const Title = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
`

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
