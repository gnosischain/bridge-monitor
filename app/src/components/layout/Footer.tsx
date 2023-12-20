import Image from 'next/image'
import styled from 'styled-components'

import { GnosisChainLogo } from '@/src/components/assets/GnosisChainLogo'
import { InnerContainer as BaseInnerContainer } from '@/src/components/helpers/InnerContainer'
import { Section } from '@/src/components/layout/Section'
import { BaseParagraph } from '@/src/components/text/BaseParagraph'

const Wrapper = styled.footer`
  color: ${({ theme: { colors } }) => colors.textColor};
  margin-top: ${({ theme: { common } }) => common.space}px;
  width: 100%;
`

const InnerContainer = styled(BaseInnerContainer)`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
`

const Paragraph = styled(BaseParagraph)`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.textColor};
  display: flex;
  flex-direction: row;
  font-size: 1.2rem;
  gap: ${({ theme: { common } }) => common.space}px;
  line-height: 1.5;
  margin: 0;

  svg {
    max-width: 24px;
  }

  a {
    display: flex;
  }
`

export const Footer: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <Section>
        <InnerContainer>
          <Paragraph>
            Developed by{' '}
            <a href="https://www.bootnode.dev/" rel="noreferrer" target="_blank">
              <Image alt="Bootnode" height={24} src="/images/bn.svg" width={24} />
            </a>
          </Paragraph>
          <Paragraph>
            Powered by <GnosisChainLogo />
          </Paragraph>
        </InnerContainer>
      </Section>
    </Wrapper>
  )
}
