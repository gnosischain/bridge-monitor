import type { NextPage } from 'next'
import styled from 'styled-components'

import { MainTitle } from '@/src/components/text/MainTitle'
import { BridgeValidators } from '@/src/components/validators'

const BridgesList = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme: { common } }) => common.space * 4}px;
`

const Validators: NextPage = () => {
  return (
    <>
      <MainTitle>Validators</MainTitle>
      <BridgesList>
        <BridgeValidators />
      </BridgesList>
    </>
  )
}
export default Validators
