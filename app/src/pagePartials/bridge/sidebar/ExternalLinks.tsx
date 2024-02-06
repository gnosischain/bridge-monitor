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
      name: 'rango.exchange',
      url: 'https://rango.exchange/',
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
