import type { NextPage } from 'next'

import { MainCard as Wrapper } from '@/src/components/card/MainCard'
import { MainTitle } from '@/src/components/text/MainTitle'
import { BaseParagraph } from '@/src/components/text/BaseParagraph'

const TermsPage: NextPage = () => {
  return (
    <Wrapper>
      <MainTitle>Terms</MainTitle>
      <BaseParagraph>Terms</BaseParagraph>
    </Wrapper>
  )
}

export default TermsPage
