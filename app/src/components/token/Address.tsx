import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { IconCopy } from '@/src/components/assets/IconCopy'
import { IconLink } from '@/src/components/assets/IconLink'
import { shortenAddress } from '@/src/utils/tools'
import { ToastComponent } from '@/src/components/toast/ToastComponent'
import { Toast, toast } from 'react-hot-toast'

const Wrapper = styled.div`
  align-items: center;
  column-gap: 4px;
  display: flex;
`

const AddressText = styled.span`
  display: block;
  overflow: hidden;
  line-height: 1.2;
`

const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.cream};
  cursor: pointer;

  &:active {
    color: ${({ theme: { colors } }) => colors.success};
    opacity: 0.6;
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

const Error = styled.span`
  color: ${({ theme: { colors } }) => colors.error};
  font-style: italic;
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
  const timeDelay = 2500

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const copyWalletAddress = (e: any, address: string) => {
    e.stopPropagation()
    e.preventDefault()

    navigator.clipboard.writeText(address)
    toast.custom(
      (t: Toast) => {
        return <ToastComponent message={'Address copied'} t={t} />
      },
      {
        duration: timeDelay,
        position: 'top-center',
        id: 'copy-address',
      },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openLink = (e: any, link: string) => {
    e.stopPropagation()
    e.preventDefault()

    window.open(link, '_blank', 'noopener noreferrer')
  }

  return (
    <Wrapper {...restProps}>
      <AddressText>
        {address ? (
          shortenAddress(address, characters + 2, characters)
        ) : (
          <Error>Fetching address...</Error>
        )}
      </AddressText>
      {address && copy && (
        <CopyButton className="copyButton" onClick={(e) => copyWalletAddress(e, address)}>
          <IconCopy height={bigIcons ? 21 : 14} width={bigIcons ? 21 : 14} />
        </CopyButton>
      )}
      {address && link && (
        <Link
          className="externalLink"
          height={bigIcons ? 21 : 14}
          onClick={(e) => openLink(e, link)}
          width={bigIcons ? 21 : 14}
        />
      )}
    </Wrapper>
  )
}
