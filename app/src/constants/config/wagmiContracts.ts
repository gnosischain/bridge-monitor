import { contracts } from '@/src/constants/config/contracts'
import { Chains } from '@/src/constants/config/types'

export const homeXdaiBridgeContract = {
  address: contracts.XDAIBridge.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.XDAIBridge.abi,
  chainId: Chains.gnosis,
} as const

export const foreignXdaiBridgeContract = {
  address: contracts.XDAIBridge.address[Chains.mainnet] as `0x${string}`,
  abi: contracts.XDAIBridge.abi,
  chainId: Chains.mainnet,
} as const

export const homeOmniBridgeContract = {
  address: contracts.OmniBridge.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.OmniBridge.abi,
  chainId: Chains.gnosis,
} as const

export const foreignOmniBridgeContract = {
  address: contracts.OmniBridge.address[Chains.mainnet] as `0x${string}`,
  abi: contracts.OmniBridge.abi,
  chainId: Chains.mainnet,
} as const

export const homeAmbContract = {
  address: contracts.AMB.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.AMB.abi,
  chainId: Chains.gnosis,
} as const

export const foreignAmbContract = {
  address: contracts.AMB.address[Chains.mainnet] as `0x${string}`,
  abi: contracts.AMB.abi,
  chainId: Chains.mainnet,
} as const

export const omniBridgeFeeManagerContract = {
  address: contracts.omnibridgeFeeManager.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.omnibridgeFeeManager.abi,
  chainId: Chains.gnosis,
} as const

export const bridgeHelperContract = {
  address: contracts.BridgeHelper.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.BridgeHelper.abi,
  chainId: Chains.gnosis,
} as const

export const bridgeHelperBeforeUsdsMigrationContract = {
  address: contracts.BridgeHelper__beforeUsdsMigration.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.BridgeHelper__beforeUsdsMigration.abi,
  chainId: Chains.gnosis,
} as const

export const ambBridgeHelperContract = {
  address: contracts.AMBBridgeHelper.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.AMBBridgeHelper.abi,
  chainId: Chains.gnosis,
} as const

export const usdsDepositContract = {
  address: contracts.USDSDeposit.address[Chains.gnosis] as `0x${string}`,
  abi: contracts.USDSDeposit.abi,
  chainId: Chains.gnosis,
} as const
