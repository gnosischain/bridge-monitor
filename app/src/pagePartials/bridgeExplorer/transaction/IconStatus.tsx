import Image from 'next/image'
import styled from 'styled-components'

export type Status = 'success' | 'waiting' | 'warning' | 'pending'

const Wrapper = styled.div<{ $status?: Status }>`
  align-items: center;
  background-color: ${({ $status, theme: { colors } }) =>
    $status === 'success'
      ? colors.successSoft
      : $status === 'waiting'
        ? colors.lilac
        : $status === 'warning'
          ? colors.warningSoft
          : colors.page};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`

interface Props {
  statusIcon?: Status
}

export const IconStatus: React.FC<Props> = ({ statusIcon, ...restProps }) => {
  const icon =
    statusIcon === 'success'
      ? 'icon-success.svg'
      : statusIcon === 'waiting'
        ? 'icon-waiting.svg'
        : statusIcon === 'warning'
          ? 'icon-warning.svg'
          : 'icon-not-required.svg'

  return (
    <Wrapper $status={statusIcon} {...restProps}>
      <Image alt="" height={24} src={`/images/${icon}`} width={24} />
    </Wrapper>
  )
}
