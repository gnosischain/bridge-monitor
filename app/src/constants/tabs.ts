interface tabsType {
  [key: string]: Array<{ title: string; href: string }>
}

export const tabs: tabsType = {
  transactions: [
    {
      title: 'xDAI',
      href: '/',
    },
    {
      title: 'AMB',
      href: '/amb-transactions',
    },
    // {
    //   title: 'Omnibridge',
    //   href: '/omnibridge-transactions',
    // },
  ],
  bridges: [
    {
      title: 'Daily bridge limits',
      href: '/daily-bridge-limits',
    },
    // {
    //   title: 'Interest funds',
    //   href: '/interest-funds',
    // },
    {
      title: 'Configuration',
      href: '/configuration',
    },
  ],
}
