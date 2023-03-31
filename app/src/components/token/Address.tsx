import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { IconCopy } from '@/src/components/assets/IconCopy'
import { IconLink } from '@/src/components/assets/IconLink'
import { shortenAddress } from '@/src/utils/tools'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  column-gap: ${({ theme: { common } }) => common.space / 4}px;

  a {
    color: ${({ theme: { colors } }) => colors.cream};
    opacity: 0.4;

    &:hover {
      opacity: 1;
    }
  }
`

const AddressText = styled.span`
  display: block;
  overflow: hidden;
`

const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }

  &.copied {
    opacity: 1;
    color: ${({ theme: { colors } }) => colors.success};
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

  const copyWalletAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toggleCopied(true)
  }

  useEffect(() => {
    const timeCopied = setTimeout(() => {
      toggleCopied(false)
    }, 2000)
    return () => clearTimeout(timeCopied)
  }, [isCopied])

  return (
    <Wrapper {...restProps}>
      <AddressText>{shortenAddress(address, characters + 2, characters)}</AddressText>
      {copy && (
        <CopyButton
          className={isCopied ? 'copied' : 'uncopied'}
          onClick={() => copyWalletAddress(address)}
        >
          <IconCopy height={bigIcons ? 21 : 14} width={bigIcons ? 21 : 14} />
        </CopyButton>
      )}
      {link && (
        <a href={link} rel="noopener noreferrer" target="_blank">
          <IconLink height={bigIcons ? 21 : 14} width={bigIcons ? 21 : 14} />
        </a>
      )}
    </Wrapper>
  )
}
