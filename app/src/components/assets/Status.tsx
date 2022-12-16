import styled from 'styled-components'

const Wrapper = styled.div<{ completed?: boolean }>`
  padding: ${({ theme: { common } }) => common.space / 4}px
    ${({ theme: { common } }) => common.space / 2}px;
  border-radius: 4px;
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.warning};
  background-color: ${(props) =>
    props.completed ? ({ theme }) => theme.colors.success : ({ theme }) => theme.colors.warning};
  strong {
    font-size: 1.2rem;
    line-height: 1.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.darkestGrey};
    display: flex;
    align-items: center;
    gap: ${({ theme: { common } }) => common.space / 2}px;
    letter-spacing: -0.2px;
    &:before {
      content: '';
      display: block;
      height: 7px;
      width: 7px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.darkestGrey};
    }
  }
`

interface Props {
  completed?: boolean
}

export const Status: React.FC<Props> = ({ completed }) => {
  return (
    <Wrapper completed={completed}>
      <strong>{completed ? 'Completed' : 'Pending'}</strong>
    </Wrapper>
  )
}
