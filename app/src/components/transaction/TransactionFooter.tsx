import Link from 'next/link'
import styled from 'styled-components'

import { LinkButton, LinkSecondaryButton } from '@/src/components/buttons/Button'

const Footer = styled.footer`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  justify-content: space-between;
  padding-bottom: 40px;

  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`
export const TransactionFooter: React.FC = () => {
  return (
    <Footer>
      <Link href="/" passHref>
        <LinkButton>&lt; Search other transactions</LinkButton>
      </Link>
      <Link href="/validators" passHref>
        <LinkSecondaryButton>Check validators status</LinkSecondaryButton>
      </Link>
    </Footer>
  )
}
