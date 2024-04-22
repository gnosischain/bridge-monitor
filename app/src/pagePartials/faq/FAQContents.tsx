import styled from 'styled-components'

import { MainCard } from '@/src/components/card/MainCard'
import { MainTitle } from '@/src/components/text/MainTitle'
import { BaseParagraph as Paragraph } from '@/src/components/text/BaseParagraph'
import { BaseSubTitle, EmphasizedTitle } from '@/src/components/text/BaseSubTitle'

const Wrapper = styled(MainCard)`
  row-gap: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletLandscapeStart}) {
    margin-bottom: calc(var(--theme-common-space) * 13);
  }
`

const Title = styled(MainTitle)`
  margin-bottom: calc(var(--theme-common-space) * 4);
`

const Subtitle = styled(BaseSubTitle)`
  &:not(:first-of-type) {
    margin-top: calc(var(--theme-common-space) * 6);
  }
`

export const FAQContents: React.FC = () => {
  return (
    <Wrapper>
      <Title>Frequently Asked Questions</Title>

      <Subtitle>Bridging Operations</Subtitle>
      <EmphasizedTitle id="q_1a">
        How do I bridge ERC20 tokens from Ethereum to Gnosis Chain?
      </EmphasizedTitle>
      <Paragraph>
        The "Bridge" tab allows you to bridge any ERC20 token from Ethereum to Gnosis Chain. <br />
        Bridging DAI from Ethereum will provide you with xDAI on the Gnosis chain, which serves as
        the gas token required for transactions.
      </Paragraph>
      <EmphasizedTitle id="q_1b">
        How long is the transfer time from Ethereum to Gnosis Chain?
      </EmphasizedTitle>
      <Paragraph>
        Transactions from Ethereum to Gnosis Chain are expected to take ~26 mins (130 blocks) due to
        the verification process through the ZK light client.
      </Paragraph>
      <EmphasizedTitle id="q_1c">
        What if I'm not coming from Ethereum? Are there alternative bridges to Gnosis Chain?
      </EmphasizedTitle>
      <Paragraph>
        If you are not coming from Ethereum, you can use one of the following bridges:
        <ul>
          <li>
            <a href="https://jumper.exchange/" rel="noreferrer" target="_blank">
              Jumper
            </a>{' '}
            (provided by Li.Fi)
          </li>
          <li>
            <a href="https://www.bungee.exchange/" rel="noreferrer" target="_blank">
              Bungee
            </a>
          </li>
          <li>
            <a href="https://app.hop.exchange/" rel="noreferrer" target="_blank">
              Hop
            </a>
          </li>
          <li>
            <a href="https://bridge.connext.network/" rel="noreferrer" target="_blank">
              Connext
            </a>
          </li>
          <li>
            <a href="https://dln.trade/" rel="noreferrer" target="_blank">
              DLN
            </a>
          </li>
          <li>
            <a href="https://app.shapeshift.com/#/trade" rel="noreferrer" target="_blank">
              shapeshift.com
            </a>
          </li>
        </ul>
      </Paragraph>
      <EmphasizedTitle id="q_1d">How do I bridge from Gnosis to Ethereum?</EmphasizedTitle>
      <Paragraph>
        To bridge from Gnosis to Ethereum, you'll have to claim your funds on Ethereum after the
        bridge transaction has been validated. You can do this by finding your transaction on the
        Bridge Explorer and clicking "Claim".
      </Paragraph>

      <Subtitle>Monitoring and Limits</Subtitle>
      <EmphasizedTitle id="q_2a">How can I monitor my bridge transactions?</EmphasizedTitle>
      <Paragraph>
        You can view and monitor your transactions by clicking on the "Search" tab. You can then
        paste your address or a transaction hash. You can also monitor the bridge validator activity
        and bridge configuration on the "Validators" and "Bridges Info" tabs respectively.
        <br /> More details here:{' '}
        <a
          href="https://docs.gnosischain.com/bridges/Bridge%20Explorer"
          rel="noreferrer"
          target="_blank"
        >
          https://docs.gnosischain.com/bridges/Bridge Explorer
        </a>
      </Paragraph>
      <EmphasizedTitle id="q_2b">Are there limits to how much I can bridge?</EmphasizedTitle>
      <Paragraph>
        Gnosis bridges have certain limits. These include a daily maximum limit, as well as minimum
        and maximum deposit limits per transaction.
        <br /> To check the current limits and the status of these bridges, click on the “Bridges
        Info” tab.
        <br /> If you are bridging funds that exceed the daily limit, your transaction will be
        delayed until the next bridge limits reset (every 24 hours).
      </Paragraph>

      <Subtitle>Troubleshooting and Additional Resources</Subtitle>
      <EmphasizedTitle id="q_3a"> What does each bridge transaction status mean?</EmphasizedTitle>
      <Paragraph>
        <ul>
          <li>
            <strong>Initiated:</strong> Transaction is initiated from the source chain.
          </li>
          <li>
            <strong>Collecting:</strong> Signatures from validators are being collected for the
            transaction.
          </li>
          <li>
            <strong>Unclaimed:</strong> Transaction has collected enough signatures, but has not yet
            been claimed on Ethereum.
          </li>
          <li>
            <strong>Completed:</strong> Transaction has been bridged successfully.
          </li>
          <li>
            <strong>Error:</strong> Transaction is not bridged successfully.
          </li>
        </ul>
      </Paragraph>
      <EmphasizedTitle id="q_3b">Where can I find technical documentation?</EmphasizedTitle>
      <Paragraph>
        For in-depth information, visit the documentation{' '}
        <a href="https://docs.gnosischain.com/bridges/" rel="noreferrer" target="_blank">
          https://docs.gnosischain.com/bridges/
        </a>
      </Paragraph>
      <EmphasizedTitle id="q_3c">What if I need further assistance?</EmphasizedTitle>
      <Paragraph>
        For additional help, join the{' '}
        <a href="https://discord.gg/gnosischain" rel="noreferrer" target="_blank">
          Gnosis Chain Discord
        </a>
        . If you encounter a specific bridge issue, feel free to open a support ticket and provide
        us with more details.
      </Paragraph>
    </Wrapper>
  )
}
