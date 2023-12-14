module.exports = {
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: 'https://mainnet.infura.io/v3/e10cd9c836f649d19e37b76a9a9c9a72',
        blockNumber: 18772048,
      },
      mining: {
        auto: false,
        interval: 1000 * 20,
      },
    },
  },
}
