import styled from 'styled-components'

// `aside` stays on the right, also on phones, so a dropdown opening leftwards from it stays on screen.
const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--theme-common-space) * 1.5) calc(var(--theme-common-space) * 2);
  justify-content: space-between;
`

const Text = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  row-gap: 2px;
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.ink};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
`

const Description = styled.p`
  color: ${({ theme: { colors } }) => colors.fog};
  font-size: 1.4rem;
  line-height: 1.5;
  margin: 0;
`

const Aside = styled.div`
  flex-shrink: 0;
  margin-left: auto;
`

interface Props {
  aside?: React.ReactNode
  description?: React.ReactNode
  title: React.ReactNode
}

export const SectionHeader: React.FC<Props> = ({ aside, description, title, ...restProps }) => (
  <Wrapper {...restProps}>
    <Text>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </Text>
    {aside && <Aside>{aside}</Aside>}
  </Wrapper>
)
