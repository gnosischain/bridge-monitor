import styled from 'styled-components'

import { Warning } from '@/src/components/assets/Warning'
import React from 'react'

const Contents = styled.div`
  display: flex;
  align-items: center;
  gap: calc(var(--theme-common-space) * 2);
  min-height: 80px;

  .warning {
    color: ${({ theme: { colors } }) => colors.warning};
  }
`

const Text = styled.div`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 1.6rem;
  line-height: 1.4;
`

const Link = styled.a`
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
  color: ${({ theme: { colors } }) => colors.textColor};
`

const url = 'https://x.com/gnosisdotio/status/1985321081255891396'
const gnosisScanUrl = 'https://gnosisscan.io/token/'

const tokens = [
  { name: 'GNO', address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb' },
  { name: 'WETH', address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1' },
  { name: 'wstETH', address: '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6' },
  { name: 'USDC', address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83' },
  { name: 'TRACE', address: '0xeddd81e0792e764501aae206eb432399a0268db5' },
  { name: 'COW', address: '0x177127622c4a00f3d409b75571e12cb3c8973d3c' },
  { name: 'WBTC', address: '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252' },
  { name: 'HOPR', address: '0xd057604a14982fe8d88c5fc25aac3267ea142a08' },
  { name: 'USDT', address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6' },
  { name: 'BDT', address: '0x778aa03021b0cd2b798b0b506403e070125d81c9' },
  { name: 'OLAS', address: '0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f' },
  { name: 'SAFE', address: '0x4d18815d14fe5c3304e87b3fa18318baa5c23820' },
  { name: 'ROCKETPOOL', address: '0xc791240D1F2dEf5938E2031364Ff4ed887133C3d' },
  { name: 'GIVETH', address: '0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75' },
  { name: 'PNK', address: '0x37b60f4e9a31a64ccc0024dce7d0fd07eaa0f7b3' },
  { name: 'CLNY', address: '0xc9b6218affe8aba68a13899cbf7cf7f14ddd304c' },
  { name: 'EURC', address: '0x54e4cb2a4fa0ee46e3d9a98d13bea119666e09f6' },
  { name: 'LINK', address: '0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2' },
  { name: 'BAL', address: '0x7ef541e2a22058048904fe5744f9c7e4c57af717' },
  { name: 'xDAI', address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
]

export const BridgeFreezeWarning: React.FC = () => {
  return (
    <>
      <Contents>
        <Warning />
        <div>
          <Text>
            In response to the latest{' '}
            <Link href={url} rel="noreferrer" target="_blank">
              Balancer hack
            </Link>
            , the outflow of the following tokens* from Gnosis Chain to Ethereum is set to 0 until
            further notice.
          </Text>{' '}
          <Text>
            Bridging from Ethereum to Gnosis Chain remains unaffected. For more information, please
            check{' '}
            <Link href={url} rel="noreferrer" target="_blank">
              here
            </Link>{' '}
          </Text>
          <Text>
            *
            {tokens.map((t, index) => (
              <React.Fragment key={t.name}>
                <Link href={`${gnosisScanUrl}${t.address}`} rel="noreferrer" target="_blank">
                  {t.name}
                </Link>

                {index < tokens.length - 1 ? ', ' : '.'}
              </React.Fragment>
            ))}
          </Text>
        </div>
      </Contents>
    </>
  )
}
