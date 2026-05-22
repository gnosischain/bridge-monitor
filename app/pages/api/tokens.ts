import type { NextApiRequest, NextApiResponse } from 'next'

import { NATIVE_TOKEN_ADDRESS, USDS_ADDRESS } from '@/src/constants/config/common'
import { isSameString } from '@/src/utils/tools'
import { Token as BaseToken } from '@/types/token'
import bridgedTokens from '@/src/constants/bridged_tokens.json'
import { zeroAddress } from 'viem'

type Token = Omit<BaseToken, 'extensions'> & {
  extensions: {
    bridgeInfo: Partial<{
      [key in 1 | 100]: {
        tokenAddress: string
      }
    }>
  }
}

const bridgedTokenName = /( on xDai| from Mainnet)$/
const WETH_ON_XDAI = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'
const DAI_ON_MAINNET = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

/**
 * Retrieves data from the 'bridgedTokens' array and processes it to create an array of 'Token' objects.
 *
 * @dev
 * The resulting array contains the tokens from the original array, plus the native counterpart for each.
 *
 * The function also checks if the tokens match the predefined addresses for WETH on Gnosis Chain,
 * and DAI on Mainnet, and modifies the list accordingly, including additional tokens in the case of native
 * counterparts for the specified tokens on each chain.
 */
export default function handler(_: NextApiRequest, res: NextApiResponse<Array<Token>>) {
  const tokens = bridgedTokens.items.flatMap((token) => {
    const { address, decimals, foreign_address, icon_url, name, origin_chain_id, symbol } = token
    const isWethOnXdai = isSameString(address, WETH_ON_XDAI)
    const isDaiOnMainnet = isSameString(foreign_address, DAI_ON_MAINNET)
    const isUsdsOnMainnet = isSameString(foreign_address, USDS_ADDRESS)
    let extraTokens: Array<Token> = []

    if (isDaiOnMainnet) {
      extraTokens = [
        {
          chainId: Number(origin_chain_id),
          address: foreign_address,
          decimals: Number(decimals),
          logoURI: icon_url ?? undefined,
          name: name.replace(bridgedTokenName, ''),
          symbol,
          extensions: {
            bridgeInfo: {
              100: {
                tokenAddress: NATIVE_TOKEN_ADDRESS,
              },
            },
          },
        },
        {
          chainId: 100,
          address: NATIVE_TOKEN_ADDRESS,
          decimals: Number(decimals),
          logoURI: icon_url ?? undefined,
          name: 'xDai',
          symbol: 'xDAI',
          extensions: {
            bridgeInfo: {
              [origin_chain_id]: {
                tokenAddress: foreign_address,
              },
            },
          },
        },
      ]
    }

    if (isWethOnXdai) {
      extraTokens = [
        {
          chainId: Number(origin_chain_id),
          address: NATIVE_TOKEN_ADDRESS,
          decimals: Number(decimals),
          logoURI: icon_url ?? undefined,
          name: 'ETH',
          symbol: 'ETH',
          extensions: {
            bridgeInfo: {
              100: {
                tokenAddress: address,
              },
            },
          },
        },
        {
          chainId: 100,
          address,
          decimals: Number(decimals),
          logoURI: icon_url ?? undefined,
          name,
          symbol,
          extensions: {
            bridgeInfo: {
              [origin_chain_id]: {
                tokenAddress: NATIVE_TOKEN_ADDRESS,
              },
            },
          },
        },
      ]
    }

    if (isUsdsOnMainnet) {
      extraTokens = [
        {
          chainId: Number(origin_chain_id),
          address: foreign_address,
          decimals: Number(decimals),
          logoURI: icon_url ?? undefined,
          name: name.replace(bridgedTokenName, ''),
          symbol,
          extensions: {
            bridgeInfo: {
              100: {
                tokenAddress: NATIVE_TOKEN_ADDRESS,
              },
            },
          },
        },
        {
          chainId: 100,
          address: NATIVE_TOKEN_ADDRESS,
          decimals: Number(decimals),
          logoURI: icon_url ?? undefined,
          name: 'xDai',
          symbol: 'xDAI',
          extensions: {
            bridgeInfo: {
              [origin_chain_id]: {
                tokenAddress: foreign_address,
              },
            },
          },
        },
      ]
    }

    return [
      {
        chainId: Number(origin_chain_id),
        address: foreign_address,
        decimals: Number(decimals),
        logoURI: icon_url ?? undefined,
        name: name.replace(bridgedTokenName, ''),
        symbol,
        extensions: {
          bridgeInfo: {
            100: {
              tokenAddress: address,
            },
          },
        },
      },
      {
        chainId: 100,
        address,
        decimals: Number(decimals),
        logoURI: icon_url ?? undefined,
        name,
        symbol,
        extensions: {
          bridgeInfo: {
            [origin_chain_id]: {
              tokenAddress: foreign_address,
            },
          },
        },
      },
      ...extraTokens.filter((token) => token.address !== zeroAddress),
    ]
  })

  res.status(200).json(tokens)
}
