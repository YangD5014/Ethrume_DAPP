// index.js
console.log('Hello, Alchemy!');
import { Network, Alchemy,Utils} from 'alchemy-sdk';

const settings = {
    apiKey: "HNARY2IAdBGELXoS5dzWr2MEdE7tuavI",
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

// const config = {
//   apiKey: "<-- ALCHEMY API KEY -->",
//   network: Network.ETH_MAINNET,
// };


// Get the latest block
const latestBlock = alchemy.core.getBlockNumber();

// Get all outbound transfers for a provided address
alchemy.core
    .getTokenBalances('0x994b342dd87fc825f66e51ffa3ef71ad818b6893')
    .then(console.log);

// Get all the NFTs owned by an address
const nfts = alchemy.nft.getNftsForOwner("vitalik.eth");

// Listen to all new pending transactions
alchemy.ws.on(
    { method: "alchemy_pendingTransactions",
    fromAddress: "vitalik.eth" },
    (res) => console.log(res)
);

console.log('laetest blcoks=',latestBlock);