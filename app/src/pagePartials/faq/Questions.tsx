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
      <Title>Bridging Operations</Title>
      <Text as="a" href="#q_1a">
        How do I bridge ERC20 tokens from Ethereum to Gnosis Chain?
      </Text>
      <Text as="a" href="#q_1b">
        How long is the transfer time from Ethereum to Gnosis Chain?
      </Text>
      <Text as="a" href="#q_1c">
        What if I'm not coming from Ethereum? Are there alternative bridges to Gnosis Chain?
      </Text>
      <Text as="a" href="#q_1d">
        How do I bridge from Gnosis to Ethereum?
      </Text>

      <Title>Monitoring and Limits</Title>
      <Text as="a" href="#q_2a">
        How can I monitor my bridge transactions?
      </Text>
      <Text as="a" href="#q_2b">
        Are there limits to how much I can bridge?
      </Text>

      <Title>Troubleshooting and Additional Resources</Title>
      <Text as="a" href="#q_3a">
        What does each bridge transaction status mean?
      </Text>
      <Text as="a" href="#q_3b">
        Where can I find technical documentation?
      </Text>
      <Text as="a" href="#q_3c">
        What if I need further assistance?
      </Text>
    </Wrapper>
  )
}
