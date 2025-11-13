# AMB Bridge Information

This file contains all the information related to the AMB Bridge. See [AMB](https://docs.gnosischain.com/bridges/tokenbridge/amb-bridge)

## Contract Validators Addresses

- Protofire: 0x459a3bd49f1ff109bc90b76125533699aaaaf9a6
- Giveth: 0x105CD22eD3D089Bf5589C59b452f9dE0796Ca52d
- Syncnode: 0x19aC7c69e5F1AC95b8d49b30Cbb79e81f1ab0dba
- GnosisDAO: 0xbdc141c8d2343f33f40cb9edd601ccf460cd0dde
- Cow Protocol: 0x674c97db4ce6cac04a124d745979f3e4cba0e9f0
- Gnosis Safe: 0x258667E543C913264388B33328337257aF208a8f
- Hopr: 0x6236925FF8Aa09f29f1609a9BcD54Af20e4be6B4

## Contract Bridge Addresses

### Ethereum

- AMB Contract Proxy (Foreign): [0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e](https://etherscan.io/address/0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e)
  - Implementation: [0x82b67a43b69914e611710c62e629dabb2f7ac6ab](https://etherscan.io/address/0x82b67a43b69914e611710c62e629dabb2f7ac6ab) (ForeignAMB)
- AMB/Omnibridge Multi-Token Mediator: [0x88ad09518695c6c3712AC10a214bE5109a655671](https://etherscan.io/address/0x88ad09518695c6c3712AC10a214bE5109a655671)
- Validator Management Contract: [0xed84a648b3c51432ad0fD1C2cD2C45677E9d4064](https://etherscan.io/address/0xed84a648b3c51432ad0fD1C2cD2C45677E9d4064)

### Gnosis

- AMB Contract Proxy (Home)	[0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59](https://gnosisscan.io/address/0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59)
  - Implementation: [0x525127c1f5670cc102b26905dccf8245c05c164f](https://gnosisscan.io/address/0x525127c1f5670cc102b26905dccf8245c05c164f) (HomeAMB)
- AMB/Omnibridge Multi-Token Mediator	[0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d](https://gnosisscan.io/address/0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d)
- Validator Management Contract: [0xA280feD8D7CaD9a76C8b50cA5c33c2534fFa5008](https://gnosisscan.io/address/0xA280feD8D7CaD9a76C8b50cA5c33c2534fFa5008)

### Events

### Gnosis -> Ethereum
HomeAMB Contract
- UserRequestForSignature(bytes32 indexed messageId, bytes encodedData)
- SignedForUserRequest(address indexed signer, bytes32 messageHash)
- CollectedSignatures(address authorityResponsibleForRelay, bytes32 messageHash, uint256 NumberOfCollectedSignatures)

ForeignAMB Contract
- RelayedMessage(address indexed sender, address indexed executor, bytes32 indexed messageId, bool status)

### Ethereum -> Gnosis
ForeignAMB Contract
- UserRequestForAffirmation(bytes32 indexed messageId, bytes encodedDatas)

HomeAMB Contract
- SignedForAffirmation(address indexed signer, bytes32 messageHash)
- AffirmationCompleted(address indexed sender, address indexed executor, bytes32 indexed messageId, bool status)
