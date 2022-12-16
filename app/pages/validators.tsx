import type { NextPage } from 'next'
import styled from 'styled-components'

import { BridgeValidators } from '@/src/components/validators'

const Wrapper = styled.div`
  margin-bottom: ${({ theme: { common } }) => common.space * 8}px;
`
const BridgesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space * 4}px;
`

const Validators: NextPage = () => {
  return (
    <Wrapper>
      <h1>Validators</h1>
      <BridgesList>
        <BridgeValidators />
      </BridgesList>
    </Wrapper>
  )
}
export default Validators
