import type { NextPage } from 'next'
import styled from 'styled-components'

import { MainCard } from '@/src/components/card/MainCard'
import { MainTitle } from '@/src/components/text/MainTitle'
import { BaseSubTitle, EmphasizedTitle } from '@/src/components/text/BaseSubTitle'
import { BaseParagraph as Paragraph } from '@/src/components/text/BaseParagraph'
import NextHead from 'next/head'
import { List, ListItem } from '@/src/components/text/List'

const Wrapper = styled(MainCard)`
  row-gap: 0;
`

const Title = styled(MainTitle)`
  margin-bottom: calc(var(--theme-common-space) * 4);
`

const PrivacyPage: NextPage = () => {
  const title = 'Privacy Policy - Gnosis Bridge Explorer'
  const description = 'Privacy policy'

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <meta content={description} name="description" />
        <meta content={title} property="og:title" />
        <meta content="website" property="og:type" />
        <meta content={description} property="og:description" />
        <meta content={title} name="twitter:site" />
      </NextHead>
      <Wrapper>
        <Title>Privacy Policy</Title>
        <Paragraph>
          <b>Last updated: DATE</b>
        </Paragraph>
        <Paragraph>
          Privacy policy lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
          eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
          eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.
        </Paragraph>
        <BaseSubTitle>PRIVACY POLICY</BaseSubTitle>
        <EmphasizedTitle>1. LOREM IPSUM</EmphasizedTitle>
        <Paragraph>
          <a href="https://gnosis.io">https://gnosis.io</a> is a site operated by Gnosis Ltd.
          (herein referred to as "Gnosis", "we", "us" or "our"). Lorem ipsum dolor sit amet,
          consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
          magna aliquyam erat, sed diam voluptua.
        </Paragraph>
        <EmphasizedTitle>2. BY USING OUR SITE LOREM IPSUM</EmphasizedTitle>
        <Paragraph>
          2.1. Privacy policy lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
          At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
          sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
          aliquyam erat, sed diam voluptua.
        </Paragraph>
        <Paragraph>
          2.2. Lorem ipsum <a href="https://gnosis.io">https://gnosis.io</a> lorem ipsum dolor sit
          amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
          dolore magna aliquyam erat, sed diam voluptua.
        </Paragraph>
        <EmphasizedTitle>3. LOREM IPSUM</EmphasizedTitle>
        <Paragraph>
          3.1. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
          tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        </Paragraph>
        <List>
          <ListItem>
            3.1.1. IN RELATION TO TITLE, LOREM IPSUM DOLOR SIT AMET, CONSETETUR SADIPSCING ELITR,
            SED DIAM NONUMY EIRMOD TEMPOR INVIDUNT UT LABORE ET DOLORE MAGNA ALIQUYAM ERAT, SED DIAM
            VOLUPTUA;
          </ListItem>
          <ListItem>
            3.1.2. THAT THE SITE OR ITS SERVICES LOREM IPSUM DOLOR SIT AMET, CONSETETUR SADIPSCING
            ELITR, SED DIAM NONUMY EIRMOD TEMPOR INVIDUNT UT LABORE ET DOLORE MAGNA ALIQUYAM ERAT,
            SED DIAM VOLUPTUA;
          </ListItem>
          <ListItem>
            3.1.3. THAT THE SITE WILL LOREM IPSUM DOLOR SIT AMET, CONSETETUR SADIPSCING ELITR, SED
            DIAM NONUMY EIRMOD TEMPOR INVIDUNT UT LABORE ET DOLORE MAGNA ALIQUYAM ERAT, SED DIAM
            VOLUPTUA OR LOREM IPSUM DOLOR SIT AMET, CONSETETUR SADIPSCING ELITR, SED DIAM NONUMY
            EIRMOD TEMPOR INVIDUNT UT LABORE ET DOLORE MAGNA ALIQUYAM ERAT, SED DIAM VOLUPTUA;
          </ListItem>
        </List>
      </Wrapper>
    </>
  )
}

export default PrivacyPage
