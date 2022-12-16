import Image from 'next/image'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 80vh;
  z-index: -1;
  img {
    object-position: left bottom;
  }
  &:after {
    content: '';
    height: 50%;
    width: 100%;
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      360deg,
      ${({ theme: { colors } }) => colors.mainBodyBackground} 0%,
      rgba(22, 29, 26, 0) 100%
    );
  }
`

export const PhotoBackground: React.FC = () => {
  return (
    <Wrapper>
      <Image alt="Monitoring" layout="fill" objectFit="cover" src="/images/bg.jpg" />
    </Wrapper>
  )
}
