/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { AnimatePresence } from 'framer-motion'

import { MenuIcon } from '@/src/components/assets/MenuIcon'
import { GnosisChainLogo } from '@/src/components/common/Logo'
import { InnerContainer as BaseInnerContainer } from '@/src/components/helpers/InnerContainer'
import { PhotoBackground } from '@/src/components/layout/PhotoBackground'
import { MainMenu } from '@/src/components/navigation/MainMenu'
import { PhoneMainMenu } from '@/src/components/navigation/PhoneMainMenu'

const Wrapper = styled.header`
  align-items: center;
  display: flex;
  flex-grow: 0;
  margin-bottom: 5vh;
  position: relative;
  max-width: 100%;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    margin-bottom: 8vh;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.desktopWideStart}) {
    margin-bottom: 12vh;
  }
  &:after {
    content: '';
    height: 1px;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: ${({ theme: { colors } }) => colors.white};
    opacity: 0.1;
  }
`

const InnerContainer = styled(BaseInnerContainer)`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  min-height: ${({ theme: { header } }) => header.height};
  align-items: stretch;
`

const Start = styled.div`
  align-items: center;
  display: flex;
  min-width: 100px;
`

const Logo = styled(GnosisChainLogo)`
  cursor: pointer;
  max-height: calc(${({ theme }) => theme.header.height} - 20px);
  max-width: 100%;

  &:active {
    opacity: 0.7;
  }
`

const End = styled.div`
  display: flex;
  align-items: center;
`

const ButtonIcon = styled.button`
  background-color: transparent;
  color: ${({ theme: { colors } }) => colors.white};
  display: block;
  padding: 0;
  border: none;
  width: 24px;
  cursor: pointer;
  position: relative;
  &:hover {
    color: ${({ theme: { colors } }) => colors.secondary};
  }
`

const HidePhone = styled.div`
  display: block;
  height: 100%;
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    display: none;
  }
`

const ShowPhone = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    display: block;
  }
`

export const Header: React.FC = (props) => {
  const [isOpen, toggleOpen] = useState(false)

  useEffect(() => {
    //Fix me later
    if (isOpen) window.document.body.style.overflow = 'hidden'
    if (!isOpen) {
      window.document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      <PhotoBackground />
      <Wrapper {...props}>
        <InnerContainer>
          <Start>
            <Link href="/" passHref>
              <a>
                <Logo />
              </a>
            </Link>
          </Start>
          <End>
            <HidePhone>
              <MainMenu />
            </HidePhone>
            <ShowPhone>
              <ButtonIcon
                onClick={() => {
                  toggleOpen(true)
                }}
              >
                <MenuIcon />
              </ButtonIcon>
            </ShowPhone>
          </End>
        </InnerContainer>
      </Wrapper>
      <AnimatePresence>
        {isOpen && <PhoneMainMenu closeMenu={() => toggleOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
