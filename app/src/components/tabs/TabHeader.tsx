import { Dispatch, SetStateAction } from 'react'
import styled, { css } from 'styled-components'

import { useGeneral } from '@/src/providers/generalProvider'

const Wrapper = styled.button<{ isActive: boolean }>`
  background-color: transparent;
  border-right: 1px solid ${({ theme }) => theme.colors.darkerGrey};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: inline-block;
  padding: ${({ theme: { common } }) => common.space * 4}px
    ${({ theme: { common } }) => common.space * 4}px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.black};

    .tabTitle {
      opacity: 1;
    }

    &:active {
      .tabTitle {
        transition: none;
        opacity: 0.75;
      }
    }
  }

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: ${({ theme }) => theme.colors.darkestGrey};
      color: ${({ theme }) => theme.colors.white};
      cursor: default;
      margin-bottom: -2px;
      opacity: 1;
      pointer-events: none;

      &:hover {
        background-color: ${({ theme }) => theme.colors.darkestGrey};
      }

      .tabTitle {
        opacity: 1;
      }
    `}

  &[disabled] {
    cursor: not-allowed;
  }
`

const Title = styled.span`
  color: #fff;
  font-size: 1.6rem;
  font-weight: 400;
  opacity: 0.5;
  transition: opacity 0.15s ease-in-out;
`

Title.defaultProps = {
  className: 'tabTitle',
}

interface Props {
  disabled?: boolean
  onClick: Dispatch<SetStateAction<string>>
  title: string
}

export const TabHeader: React.FC<Props> = ({ disabled, onClick, title }) => {
  const { activeTab, setActiveTab } = useGeneral()
  const isActive = title === activeTab

  const handleActive = () => {
    setActiveTab(title)
    onClick(title)
  }

  return (
    <Wrapper disabled={disabled} isActive={isActive} onClick={handleActive}>
      {/*
        This is a hack to change the title from AMB to Omnibridge (the fucking code doesn't work if you change it in tabs.ts because the contents are fucking tied to the tab's title)

        Remove when somebody refactors this to make it work as it should (ie: not tied to the tab's title).
      */}
      <Title>{title === 'AMB' ? 'Omnibridge' : title}</Title>
    </Wrapper>
  )
}
