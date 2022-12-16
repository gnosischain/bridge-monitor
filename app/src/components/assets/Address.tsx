import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { IconCopy } from '@/src/components/assets/IconCopy'
import { IconLink } from '@/src/components/assets/IconLink'
import { shortenAddress } from '@/src/utils/tools'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme: { common } }) => common.space / 2}px;
  min-width: 150px;
  a {
    color: ${({ theme: { colors } }) => colors.cream};
    opacity: 0.4;
    &:hover {
      opacity: 1;
    }
  }
`
const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme: { colors } }) => colors.cream};
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
  address: string
  link?: string
  copy?: boolean
}

export const Address: React.FC<Props> = ({ address, copy = true, link }) => {
  const [isCopied, toggleCopied] = useState(false)

  const copyWalletAddress = (address: string) => {
    // Copy to clipboard
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
    <Wrapper>
      {shortenAddress(address)}
      {copy && (
        <CopyButton
          className={isCopied ? 'copied' : 'uncopied'}
          onClick={() => copyWalletAddress(address)}
        >
          <IconCopy />
        </CopyButton>
      )}
      {link && (
        <a href={link} rel="noopener noreferrer" target="_blank">
          <IconLink />
        </a>
      )}
    </Wrapper>
  )
}
