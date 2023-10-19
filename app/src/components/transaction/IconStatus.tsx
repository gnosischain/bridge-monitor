import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.span<{ status?: string }>`
  align-items: center;
  background-color: ${(props) =>
    props.status === 'warning'
      ? ({ theme }) => theme.colors.warning
      : ({ theme }) => theme.colors.darkGrey};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`

interface Props {
  status?: string
}

export const IconStatus: React.FC<Props> = ({ status, ...restProps }) => {
  const icon =
    status === 'success'
      ? '/images/icon-success.svg'
      : status === 'waiting'
      ? '/images/icon-waiting.svg'
      : status === 'warning'
      ? '/images/icon-warning.svg'
      : '/images/icon-not-required.svg'

  return (
    <Wrapper status={status} {...restProps}>
      <Image alt={status} height={24} src={icon} width={24} />
    </Wrapper>
  )
}
