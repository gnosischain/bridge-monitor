export const bridgeBaseURL = '/'
export const bridgeExplorerBaseURL = '/bridge-explorer'
export const bridgePagesBaseURL = `/bridge`
export const transactionBaseURL = `${bridgeExplorerBaseURL}/transaction`
export const latestTransactionsBaseURL = `${bridgeExplorerBaseURL}/latest-transactions`
export const myTransactionsBaseURL = `${bridgeExplorerBaseURL}/my-transactions`
export const myTransactionsFullURL = `${myTransactionsBaseURL}?hash=`

export const bridgeSections = [
  {
    section: 'Bridge',
    href: `${bridgeBaseURL}`,
  },
] as const

export const bridgeExplorerSections = [
  {
    section: 'Search',
    href: `${bridgeExplorerBaseURL}`,
  },
  {
    section: 'Latest Transactions',
    href: `${latestTransactionsBaseURL}`,
  },
  {
    section: 'Bridges Info',
    href: `${bridgeExplorerBaseURL}/bridges`,
  },
  {
    section: 'Validators',
    href: `${bridgeExplorerBaseURL}/validators`,
  },
] as const

export const mainMenuSections = [...bridgeSections, ...bridgeExplorerSections]
