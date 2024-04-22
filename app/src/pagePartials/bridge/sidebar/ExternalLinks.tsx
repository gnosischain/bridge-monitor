import { SCLink, SCText, SCTitle, Wrapper } from '@/src/components/card/SidebarCard'

export const ExternalLinks: React.FC = ({ ...restProps }) => {
  const links = [
    {
      name: 'jumper.exchange',
      url: 'https://jumper.exchange/',
    },
    {
      name: 'bungee.exchange',
      url: 'https://www.bungee.exchange/',
    },
    {
      name: 'dln.trade',
      url: 'https://dln.trade/',
    },
    {
      name: 'shapeshift.com',
      url: 'https://app.shapeshift.com/#/trade',
    },
  ]

  return (
    <Wrapper {...restProps}>
      <SCTitle>Coming from another chain?</SCTitle>
      <SCText>You might be interested in trying:</SCText>
      {links.map((link) => (
        <SCLink href={link.url} key={link.name}>
          {link.name}
        </SCLink>
      ))}
    </Wrapper>
  )
}
