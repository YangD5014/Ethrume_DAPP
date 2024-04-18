// const { Alchemy, Network, Utils } = require("alchemy-sdk");
// const  Alchemy_APIKEY = 'HNARY2IAdBGELXoS5dzWr2MEdE7tuavI';
const  Wallet_PrivateKey = '599925605f99ed15b3cff79af6b4963fbbfda7b07b57a1b9fdeaadac45d03bf4';
const  Contract_Adress = '0x86b4Fca6D4e8e177241054082148D7f6eD7c945f';
// const  Etherscan_APIKEY ='DDB8FIAX4Y532IBGJWTZFKEX8SCQ65Q1VI';
const  Infura_APIKEY= '52e5d92b6103413ea1a544b0f4f545f5'

// import { Network, Alchemy,Utils} from 'alchemy-sdk';
const { ethers, assert } = require("ethers");
const Contract = require('../smart_contract/contract.json')
console.log('ethers=',ethers);

//const alchemy_provider = new ethers.AlchemyProvider(network=Network.ETH_SEPOLIA, Alchemy_APIKEY);
const Infura_provider = new ethers.InfuraProvider(
    'sepolia' ,Infura_APIKEY
);
const Signer  = new ethers.Wallet(Wallet_PrivateKey, Infura_provider);

const UserRegistration_contract = new ethers.Contract(Contract_Adress, Contract, Signer);


async function getNameById(id){
    console.log('开始调用合约方法getUserThrougId');
    const name_of_firstuser = await UserRegistration_contract.getUserThrougId(id);
    console.log('ID是 ',id,' 的用户名称为: ',name_of_firstuser); 
    return name_of_firstuser;   
}

async function Register() {
    try {
            //开始调用修改状态的合约方法
        const tx = await UserRegistration_contract.register('鲜享链官方运营团队04155',2);
        await tx.wait();
        console.log("Transaction hash:", tx.hash);
        console.log("State changed successfully.");
    } catch (error) {
        console.error("Error:", error);
    }
}
// export {UserRegistration_contract,getNameById,Register}
//Register();
getNameById(0);
