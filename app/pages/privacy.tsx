import type { NextPage } from 'next'

import { MainWrapper as Wrapper } from '@/src/components/layout/MainWrapper'
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
