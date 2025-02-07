import Image from 'next/image'
import styled, { keyframes } from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.cream};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

// const WrapperBordered = styled(Wrapper)`
//   border-right: 1px solid #40d194;
//   border-left: 1px solid #40d194;
//   border-top: 1px solid #40d194;
//   border-bottom: 1px solid rgba(221, 212, 190, 0.5);
//   animation: ${rotate} 1.5s linear infinite;
// `

const WrapperBordered = styled(Wrapper)`
  border: 1px solid #40d194;
  animation: ${pulse} 1.5s linear infinite;
`

const WrapperAnimated = styled(Wrapper)`
  animation: ${rotate} 1.5s ease-in-out infinite;
`

export type Status = 'success' | 'waiting' | 'warning' | 'pending' | 'none'

interface Props {
  statusIcon?: Status
}

export const IconStatus: React.FC<Props> = ({ statusIcon, ...restProps }) => {
  const icon =
    statusIcon === 'success'
      ? 'icon-success.svg'
      : statusIcon === 'pending'
      ? 'icon-waiting.svg'
      : statusIcon === 'warning'
      ? 'icon-warning.svg'
      : 'icon-not-required.svg'

  if (statusIcon === 'waiting') return <WrapperBordered {...restProps} />
  if (statusIcon === 'none') return <Wrapper {...restProps} />
  if (statusIcon === 'pending')
    return (
      <WrapperAnimated {...restProps}>
        <Image alt="" height={24} src={`/images/${icon}`} width={24} />
      </WrapperAnimated>
    )

  return (
    <Wrapper {...restProps}>
      <Image alt="" height={24} src={`/images/${icon}`} width={24} />
    </Wrapper>
  )
}
