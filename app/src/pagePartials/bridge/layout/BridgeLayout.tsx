import styled from 'styled-components'
import { InnerContainer } from '@/src/components/innerContainer'
import { Search } from '@/src/pagePartials/bridge/sidebar/Search'
import { ExternalLinks } from '@/src/pagePartials/bridge/sidebar/ExternalLinks'
import { PropsWithChildren } from 'react'

// Form and rail centred as one group; their last cards stretch so both columns end on the same line.
const Wrapper = styled(InnerContainer)`
  align-content: start;
  display: grid;
  flex-grow: 1;
  gap: calc(var(--theme-common-space) * 2);
  grid-template-columns: minmax(0, 640px);
  justify-content: center;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.desktopStart}) {
    gap: calc(var(--theme-common-space) * 3);
    grid-template-columns: minmax(0, 640px) minmax(280px, 320px);
  }
`

const Main = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;

  > * {
    flex-grow: 1;
  }
`

const Rail = styled.aside`
  display: flex;
  flex-direction: column;
  min-width: 0;
  row-gap: calc(var(--theme-common-space) * 2);

  > :last-child {
    flex-grow: 1;
  }
`

export const BridgeLayout: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <Wrapper>
      <Main>{children}</Main>
      <Rail>
        <Search />
        <ExternalLinks />
      </Rail>
    </Wrapper>
  )
}
