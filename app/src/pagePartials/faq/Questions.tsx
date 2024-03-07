import styled from 'styled-components'
import { Wrapper as BaseWrapper, SCText, SCTitle } from '@/src/components/card/SidebarCard'

const Wrapper = styled(BaseWrapper)`
  position: sticky;
  top: calc(var(--theme-common-space) * 3);
`

const Title = styled(SCTitle)`
  &:not(:first-child) {
    margin-top: calc(var(--theme-common-space) * 3);
  }
`

const Text = styled(SCText)`
  margin-bottom: calc(var(--theme-common-space) * 2);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export const Questions: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Title>General</Title>
      <Text as="a" href="#q_1a">
        What is blockchain?
      </Text>
      <Text as="a" href="#q_1b">
        What is ethereum?
      </Text>
      <Text as="a" href="#q_1c">
        What is the difference between Bitcoin and Ethereum?
      </Text>
      <Title>General 2</Title>
      <Text as="a" href="#q_2a">
        What is blockchain 2?
      </Text>
      <Text as="a" href="#q_2b">
        What is ethereum 2?
      </Text>
      <Text as="a" href="#q_2c">
        What is the difference between Bitcoin and Ethereum 2?
      </Text>
      <Title>General 3</Title>
      <Text as="a" href="#q_3a">
        What is blockchain 3?
      </Text>
      <Text as="a" href="#q_3b">
        What is ethereum 3?
      </Text>
      <Text as="a" href="#q_3c">
        What is the difference between Bitcoin and Ethereum 3?
      </Text>
    </Wrapper>
  )
}
