'use client'
import styled, { css } from 'styled-components'

import { IconCopy } from '@/src/components/assets/IconCopy'
import { IconLink } from '@/src/components/assets/IconLink'
import { shortenAddress } from '@/src/utils/tools'
import { useCopyToast } from '@/src/hooks/useCopyToast'
import useWeb3Name from '@/src/hooks/useWeb3Name'

const CommonCSS = css`
  transition: color 0.15s ease-in-out;

  &:hover {
    color: ${({ theme: { colors } }) => colors.primaryDark};
  }

  &:active {
    opacity: 0.6;
  }
`

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--theme-common-space);
  display: flex;
`

const AddressText = styled.span`
  display: block;
  overflow: hidden;
  line-height: 1.2;
  white-space: nowrap;
`

const CopyButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;
  padding: 0;

  ${CommonCSS}
`

const Link = styled(IconLink)`
  color: ${({ theme: { colors } }) => colors.primary};
  cursor: pointer;

  ${CommonCSS}
`

const Error = styled.span`
  color: ${({ theme: { colors } }) => colors.error};
  font-style: italic;
`

interface Props {
  address: string
  bigIcons?: boolean
  characters?: number
  copy?: boolean
  href?: string
  useDomain?: boolean
}

export const TokenAddress: React.FC<Props> = ({
  address,
  bigIcons = false,
  characters = 4,
  copy = false,
  href,
  useDomain,
  ...restProps
}) => {
  const { copy: copyToClipboard } = useCopyToast()

  const { resolvedName: domainName } = useWeb3Name({ address: useDomain ? address : undefined })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openLink = (e: any, href: string) => {
    e.stopPropagation()
    e.preventDefault()

    window.open(href, '_blank', 'noopener noreferrer')
  }

  return (
    <Wrapper {...restProps}>
      <AddressText>
        {domainName ? (
          <>{domainName}</>
        ) : (
          <>
            {address ? (
              shortenAddress(address, characters + 2, characters)
            ) : (
              <Error>Fetching address...</Error>
            )}
          </>
        )}
      </AddressText>
      {address && copy && (
        <CopyButton
          className="copyButton"
          onClick={(e: React.MouseEvent) => copyToClipboard(e, address)}
        >
          <IconCopy height={bigIcons ? 21 : 14} width={bigIcons ? 21 : 14} />
        </CopyButton>
      )}
      {address && href && (
        <Link
          className="externalLink"
          height={bigIcons ? 21 : 14}
          onClick={(e: React.MouseEvent) => openLink(e, href)}
          width={bigIcons ? 21 : 14}
        />
      )}
    </Wrapper>
  )
}
