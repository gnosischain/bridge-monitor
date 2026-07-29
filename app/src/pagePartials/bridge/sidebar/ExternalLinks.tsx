import { SCLink, SCText, SCTitle, Wrapper } from '@/src/components/card/SidebarCard'
import { EXTERNAL_BRIDGES } from '@/src/constants/externalBridges'

export const ExternalLinks: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <SCTitle>Coming from another chain?</SCTitle>
      <SCText>You might be interested in trying:</SCText>
      {EXTERNAL_BRIDGES.map((link) => (
        <SCLink href={link.url} key={link.name} rel="noopener noreferrer" target="_blank">
          {link.name}
        </SCLink>
      ))}
    </Wrapper>
  )
}
