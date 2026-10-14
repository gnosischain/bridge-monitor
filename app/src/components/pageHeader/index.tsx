import styled from 'styled-components'
import { Eyebrow } from '@/src/components/text/Eyebrow'

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: calc(var(--theme-common-space) * 2);
  padding-top: var(--theme-common-space);

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
  }
`

const Text = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  row-gap: var(--theme-common-space);
`

const Title = styled.h1`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.familyHeading};
  font-size: 3.6rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    font-size: 4.8rem;
  }
`

const Description = styled.div`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.6rem;
  line-height: 1.5;
`

const Aside = styled.div`
  flex-shrink: 0;
`

interface Props {
  aside?: React.ReactNode
  description?: React.ReactNode
  eyebrow?: string
  title: React.ReactNode
}

export const PageHeader: React.FC<Props> = ({
  aside,
  description,
  eyebrow,
  title,
  ...restProps
}) => (
  <Wrapper {...restProps}>
    <Text>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </Text>
    {aside && <Aside>{aside}</Aside>}
  </Wrapper>
)
