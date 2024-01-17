import type { NextPage } from 'next'

import { MainCard as Wrapper } from '@/src/components/card/MainCard'
import { MainTitle } from '@/src/components/text/MainTitle'
import { BaseParagraph } from '@/src/components/text/BaseParagraph'

const PrivacyPage: NextPage = () => {
  return (
    <Wrapper>
      <MainTitle>Privacy Policy</MainTitle>
      <BaseParagraph>Privacy Policy</BaseParagraph>
    </Wrapper>
  )
}

export default PrivacyPage
