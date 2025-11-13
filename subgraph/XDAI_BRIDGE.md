# XDAI Bridge Information

This file contains all the information related to the XDAI Bridge. See [XDAI](https://docs.gnosischain.com/bridges/tokenbridge/xdai-bridge)

## Contract Validators Addresses

- CowProtocol: gno:0x587c0d02b40822f15f05301d87c16f6a08aaddde
- Giveth: gno:0xc073C8E5ED9Aa11CF6776C69b3e13b259Ba9F506
- GnosisDao: gno:0x97630e2ae609d4104abda91f3066c556403182dd
- GnosisSafe: gno:0x1312e98995bbcc30fc63db3cef807e20cdd33dca
- Protofire: gno:0x4d1c96b9a49c4469a0b720a22b74b034eddfe051
- Syncnode: gno:0xfe24cfb2f8872e9ed097c451de065a9f6048915b
- Hopr: gno:0x6236925FF8Aa09f29f1609a9BcD54Af20e4be6B4

## Contract Bridge Addresses

### Ethereum

- Proxy Contract: [0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016](https://etherscan.io/address/0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016)
  - Implementation: [0xeee4f8db4410bebd74a76cb711d096c5e66d0473](https://etherscan.io/address/0xeee4f8db4410bebd74a76cb711d096c5e66d0473) (XDaiForeignBridge/ForeignBridgeErcToNative)
- Validator Management Contract: 0xe1579dEbdD2DF16Ebdb9db8694391fa74EeA201E
- Admin Multisignature Wallet: 0xff1a8EDA5eAcdB6aAf729905492bdc6376DBe2dd

### Gnosis
- Proxy Contract:	[0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6](https://gnosisscan.io/address/0x7301cfa0e1756b71869e93d4e4dca5c7d0eb0aa6)
  - Implementation: [0x3b3887242f423c472044246bc06b55e4dc632aae](https://gnosisscan.io/address/0x3b3887242f423c472044246bc06b55e4dc632aae) (HomeBridgeErcToNative)
- Block Reward Contract: 0x481c034c6d9441db23Ea48De68BCAe812C5d39bA
- Validator Management Contract: 0xB289f0e6fBDFf8EEE340498a56e1787B303F1B6D
- Admin Multisignature Wallet: 0x0d3726e5a9f37234d6b55216fc971d30f150a60f

### Events

### Gnosis -> Ethereum
HomeBridgeErcToNative Contract
- UserRequestForSignature
- SignedForUserRequest
- CollectedSignatures

ForeignBridgeErcToNative Contract
- RelayedMessage

### Ethereum -> Gnosis
ForeignBridgeErcToNative Contract
- UserRequestForAffirmation

HomeBridgeErcToNative Contract
- SignedForAffirmation
- AffirmationCompleted
