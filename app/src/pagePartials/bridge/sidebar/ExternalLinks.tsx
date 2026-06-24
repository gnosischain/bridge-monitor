import { SCLink, SCText, SCTitle, Wrapper } from '@/src/components/card/SidebarCard'

export const ExternalLinks: React.FC = ({ ...restProps }) => {
  const links = [
    {
      name: 'stargate.finance',
      url: 'https://stargate.finance/bridge',
    },
    {
      name: 'relay.link',
      url: 'https://relay.link/bridge/gnosis',
    },
    {
      name: 'cow.fi',
      url: 'https://swap.cow.fi/#/100/swap/',
    },
    {
      name: 'jumper.exchange',
      url: 'https://jumper.exchange/',
    },
    {
      name: 'bungee.exchange',
      url: 'https://www.bungee.exchange/',
    },
    {
      name: 'shapeshift.com',
      url: 'https://app.shapeshift.com/#/trade',
    },
    {
      name: 'symbiosis.finance',
      url: 'https://app.symbiosis.finance/swap',
    },
    {
      name: 'squid',
      url: 'https://app.squidrouter.com/',
    },
  ]

  return (
    <Wrapper {...restProps}>
      <SCTitle>Coming from another chain?</SCTitle>
      <SCText>You might be interested in trying:</SCText>
      {links.map((link) => (
        <SCLink href={link.url} key={link.name} rel="noopener noreferrer" target="_blank">
          {link.name}
        </SCLink>
      ))}
    </Wrapper>
  )
}
