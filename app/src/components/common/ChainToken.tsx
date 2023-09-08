import styled from 'styled-components'

import { Tooltip } from '@/src/components/common/Tooltip'

const Wrapper = styled.div<{ withNames?: boolean }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  font-size: 1.2rem;
  gap: ${({ theme: { common } }) => common.space / 2}px;
  height: ${(props) => (props.withNames ? '22px' : 'auto')};
  padding-right: ${(props) => (props.withNames ? '4px' : '0')};
  position: relative;
  z-index: 1;

  span:first-of-type {
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
  }

  strong {
    font-weight: 300;
    font-size: 1.4rem;
  }
`
interface Props {
  name: string
  showName?: boolean
}

export const ChainToken: React.FC<Props> = ({ children, name, showName, ...restProps }) => {
  return (
    <Wrapper withNames={showName} {...restProps}>
      <Tooltip text={name}>{children}</Tooltip>
      {showName && name}
    </Wrapper>
  )
}
