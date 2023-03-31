import Link from 'next/link'
import styled from 'styled-components'

import { LinkButton, LinkSecondaryButton } from '@/src/components/buttons/Button'

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme: { common } }) => common.space * 2}px;
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopStart}) {
    display: flex;
    flex-direction: row;
    align-items: center;
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
