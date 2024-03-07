import styled from 'styled-components'

import { MainCard } from '@/src/components/card/MainCard'
import { MainTitle } from '@/src/components/text/MainTitle'
import { BaseParagraph as Paragraph } from '@/src/components/text/BaseParagraph'
import { BaseSubTitle, EmphasizedTitle } from '@/src/components/text/BaseSubTitle'

const Wrapper = styled(MainCard)`
  row-gap: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    margin-bottom: calc(var(--theme-common-space) * 13);
  }
`

const Title = styled(MainTitle)`
  margin-bottom: calc(var(--theme-common-space) * 4);
`

const Subtitle = styled(BaseSubTitle)`
  &:not(:first-of-type) {
    margin-top: calc(var(--theme-common-space) * 5);
  }
`

export const FAQContents: React.FC = () => {
  return (
    <Wrapper>
      <Title>Frequently Asked Questions</Title>
      <Subtitle>General</Subtitle>
      <EmphasizedTitle id="q_1a">What is blockchain?</EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
      </Paragraph>
      <EmphasizedTitle id="q_1b">What is ethereum?</EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
      </Paragraph>
      <EmphasizedTitle id="q_1c">
        What is the difference between Bitcoin and Ethereum?
      </EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit
        amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
        et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
      </Paragraph>
      <Subtitle>General 2</Subtitle>
      <EmphasizedTitle id="q_2a">What is blockchain 2?</EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
      </Paragraph>
      <EmphasizedTitle id="q_2b">What is ethereum 2?</EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
      </Paragraph>
      <EmphasizedTitle id="q_2c">
        What is the difference between Bitcoin and Ethereum 2?
      </EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit
        amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
        et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
      </Paragraph>
      <Subtitle>General 3</Subtitle>
      <EmphasizedTitle id="q_3a">What is blockchain 3?</EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
        et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
      </Paragraph>
      <EmphasizedTitle id="q_3b">What is ethereum 3?</EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
      </Paragraph>
      <EmphasizedTitle id="q_3c">
        What is the difference between Bitcoin and Ethereum 3?
      </EmphasizedTitle>
      <Paragraph>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit
        amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
        dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
        et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
      </Paragraph>
    </Wrapper>
  )
}
