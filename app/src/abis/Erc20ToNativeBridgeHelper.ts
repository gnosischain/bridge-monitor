export default [
  {
    "inputs": [
      { "internalType": "address", "name": "_homeBridge", "type": "address" },
      { "internalType": "address", "name": "_foreignBridge", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "bridge",
    "outputs": [{ "internalType": "contract IHomeErc20ToNativeBridge", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "clean",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_msgHash", "type": "bytes32" }],
    "name": "getMessage",
    "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_recipient", "type": "address" },
      { "internalType": "uint256", "name": "_value", "type": "uint256" },
      { "internalType": "bytes32", "name": "_origTxHash", "type": "bytes32" }
    ],
    "name": "getMessageHash",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_msgHash", "type": "bytes32" }],
    "name": "getSignatures",
    "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const
