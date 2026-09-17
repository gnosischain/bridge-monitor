interface BlockedToken {
  tokenOutAddress: string
  mediator: string
  mode: 'ERC677' | 'D-ERC20'
}

const blockedTokens: Record<string, BlockedToken> = {
  // HNY -> mainnet
  '0xc3589f56b6869824804a5ea29f2c9886af1b0fce': {
    tokenOutAddress: '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9',
    mediator: '0x81a4833b3a40e7c61efe9d1a287343797993b1e8',
    mode: 'ERC677',
  },
  // DATA -> gnosis
  '0x256eb8a51f382650b2a1e946b8811953640ee47d': {
    tokenOutAddress: '0x8f693ca8d21b157107184d29d398a8d082b38b76',
    mediator: '0x53f3f44c434494da73ec44a6e8a8d091332bc2ce',
    mode: 'D-ERC20',
  },
  // DATA -> mainnet
  '0x8f693ca8d21b157107184d29d398a8d082b38b76': {
    tokenOutAddress: '0x256eb8a51f382650b2a1e946b8811953640ee47d',
    mediator: '0x29e572d45cc33d5a68dcc8f92bfc7ded0017bc59',
    mode: 'D-ERC20',
  },
  // XDATA -> gnosis
  '0xe4a2620ede1058d61bee5f45f6414314fdf10548': {
    tokenOutAddress: '0x0cf0ee63788a0849fe5297f3407f701e122cc023',
    mediator: '0x7d55f9981d4e10a193314e001b96f72fcc901e40',
    mode: 'D-ERC20',
  },
  // AGVE -> mainnet
  '0x0b006e475620af076915257c6a9e40635abdbbad': {
    tokenOutAddress: '0x3a97704a1b25f08aa230ae53b352e2e72ef52843',
    mediator: '0x5689c65cfe5e8bf1a5f836c956dea1b3b8be00bb',
    mode: 'ERC677',
  },
}

export const isBlockedToken = (address: string): boolean => {
  const normalizedAddress = address.toLowerCase()

  if (normalizedAddress in blockedTokens) {
    return true
  }

  return Object.values(blockedTokens).some(
    (token) => token.tokenOutAddress.toLowerCase() === normalizedAddress,
  )
}
