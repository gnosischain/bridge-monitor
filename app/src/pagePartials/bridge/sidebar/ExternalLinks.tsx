import { SCLink, SCText, SCTitle, Wrapper } from '@/src/components/card/SidebarCard'

export const ExternalLinks: React.FC = ({ ...restProps }) => {
  const links = [
    {
      name: 'debridge.finance',
      url: 'https://app.debridge.finance/',
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
      name: 'relay.link',
      url: 'https://relay.link/bridge/gnosis',
    },
  ]

  return (
    <Wrapper {...restProps}>
      <SCTitle>Coming from another chain?</SCTitle>
      <SCText>You might be interested in trying:</SCText>
      {links.map((link, index) => (
        <SCLink
          href={link.url}
          key={link.name}
          rel="noopener noreferrer"
          style={{ fontWeight: index === 0 ? '700' : '' }}
          target="_blank"
        >
          {link.name}
        </SCLink>
      ))}
    </Wrapper>
  )
}
