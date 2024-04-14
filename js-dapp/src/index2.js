const { Alchemy, Network, Utils } = require("alchemy-sdk");
// import { Network, Alchemy,Utils} from 'alchemy-sdk';

const config = {
  apiKey: "HNARY2IAdBGELXoS5dzWr2MEdE7tuavI",
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);
const latestBlock = alchemy.core.getBlockNumber();

alchemy.core
    .getTokenBalances('0xE07E6b29F2fA43fc51d2c16FA68AA5353E8680AE')
    .then(console.log);

console.log('laetest blcoks=',latestBlock);