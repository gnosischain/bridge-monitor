import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkGrey};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`

export type Status = 'success' | 'waiting' | 'warning' | 'pending'

interface Props {
  statusIcon?: Status
}

export const IconStatus: React.FC<Props> = ({ statusIcon, ...restProps }) => {
  const icon =
    statusIcon === 'success'
      ? '/images/icon-success.svg'
      : statusIcon === 'waiting'
      ? '/images/icon-waiting.svg'
      : statusIcon === 'warning'
      ? '/images/icon-warning.svg'
      : '/images/icon-not-required.svg'

  return (
    <Wrapper {...restProps}>
      <Image alt="" height={24} src={icon} width={24} />
    </Wrapper>
  )
}
