import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { IconCopy } from '@/src/components/assets/IconCopy'
import { IconLink } from '@/src/components/assets/IconLink'
import { shortenAddress } from '@/src/utils/tools'

const Wrapper = styled.div`
  align-items: center;
  column-gap: ${({ theme: { common } }) => common.space / 4}px;
  display: flex;
`

const AddressText = styled.span<{ link?: boolean }>`
  display: block;
  overflow: hidden;

  ${({ link }) =>
    link &&
    css`
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    `}
`

const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;

  &:active {
    opacity: 0.6;
  }

  &.copied {
    opacity: 1;
    color: ${({ theme: { colors } }) => colors.success};
  }
`

const Link = styled(IconLink)`
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;

  &:active {
    color: ${({ theme: { colors } }) => colors.success};
    opacity: 0.6;
  }
`

interface Props {
  characters?: number
  address: string
  bigIcons?: boolean
  copy?: boolean
  link?: string
}

export const Address: React.FC<Props> = ({
  address,
  bigIcons = false,
  characters = 4,
  copy = false,
  link,
  ...restProps
}) => {
  const [isCopied, toggleCopied] = useState(false)

  const copyWalletAddress = (e: any, address: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    toggleCopied(true)
  }

  const openLink = (e: any, link: string) => {
    e.stopPropagation()
    window.open(link, '_blank', 'noopener noreferrer')
  }

  useEffect(() => {
    const timeCopied = setTimeout(() => {
      toggleCopied(false)
    }, 2000)
    return () => clearTimeout(timeCopied)
  }, [isCopied])

  return (
    <Wrapper {...restProps}>
      <AddressText link={link ? true : false} onClick={link ? (e) => openLink(e, link) : undefined}>
        {shortenAddress(address, characters + 2, characters)}
      </AddressText>
      {copy && (
        <CopyButton
          className={isCopied ? 'copied' : 'uncopied'}
          onClick={(e) => copyWalletAddress(e, address)}
        >
          <IconCopy height={bigIcons ? 21 : 14} width={bigIcons ? 21 : 14} />
        </CopyButton>
      )}
      {link && (
        <Link
          height={bigIcons ? 21 : 14}
          onClick={(e) => openLink(e, link)}
          width={bigIcons ? 21 : 14}
        />
      )}
    </Wrapper>
  )
}
