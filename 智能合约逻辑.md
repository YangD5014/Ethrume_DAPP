智能合约可以被认为是DAPP业务逻辑的代码实现，使用solidity代码部署在区块链的网络中，其产生的数据、交易所有在该区块链网络下的人员都可以通过代码查询。

1. 规则透明，所有人都可以看到DAPP的逻辑
2. 自动运行，并且可以触发许多事件、交易用来监测运行情况
3. 数据信任，经由智能合约产生的数据不会被篡改

因此DAPP的优越之处可以被理解为：

1. 由于规则透明，用户很清楚整个运营规则。不会被网站运营方一家独大，比如不存在删库跑路的情况。
2. 规则自动运行，用户可以通过“链上动态”等功能看到目前规则运行情况。比如，商城内哪个卖家的礼品卡兑换率最低、差评最多、兑换最慢？这种数据在中心化APP中可以被后台修改、刷数据，但是在DAPP中无法被修改、刷单成本特别大。

以下是我写的智能合约代码：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GiftCardNFT is ERC721, Ownable {
    // 账户类型枚举
    enum AccountType { Consumer, Merchant, Operator }

    // 礼品卡NFT状态枚举
    enum CardStatus { Minted, Issued, Redeemed, Burned }

    // 商家结构体
    struct Merchant {
        address merchantAddress;
        string merchantName;
        bool isApproved;
    }

    // 礼品卡NFT结构体
    struct GiftCard {
        uint256 tokenId;
        address merchant;
        uint256 value;
        CardStatus status;
    }

    // 事件
    event MerchantAdded(address merchantAddress, string merchantName);
    event MerchantApproved(address merchantAddress);
    event MerchantRejected(address merchantAddress);
    event CardMinted(uint256 tokenId, address merchant, uint256 value);
    event CardIssued(uint256 tokenId);
    event CardTraded(uint256 tokenId, address from, address to);
    event CardRedeemed(uint256 tokenId);
    event CardBurned(uint256 tokenId);

    // 映射
    mapping(address => AccountType) public accountTypes;
    mapping(address => Merchant) public merchants;
    mapping(uint256 => GiftCard) public giftCards;

    // 构造函数
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    // 添加商家
    function addMerchant(address merchantAddress, string memory merchantName) public onlyOwner {
        require(accountTypes[merchantAddress] == AccountType.Merchant, "Account type is not Merchant");
        merchants[merchantAddress] = Merchant(merchantAddress, merchantName, false);
        emit MerchantAdded(merchantAddress, merchantName);
    }

    // 审核商家
    function approveMerchant(address merchantAddress) public onlyOwner {
        require(merchants[merchantAddress].merchantAddress != address(0), "Merchant does not exist");
        merchants[merchantAddress].isApproved = true;
        emit MerchantApproved(merchantAddress);
    }

    // 拒绝商家
    function rejectMerchant(address merchantAddress) public onlyOwner {
        require(merchants[merchantAddress].merchantAddress != address(0), "Merchant does not exist");
        delete merchants[merchantAddress];
        emit MerchantRejected(merchantAddress);
    }

    // 商家铸造礼品卡NFT
    function mintGiftCard(uint256 value) public returns (uint256) {
        require(accountTypes[msg.sender] == AccountType.Merchant, "Account type is not Merchant");
        require(merchants[msg.sender].isApproved, "Merchant is not approved");
        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);
        giftCards[tokenId] = GiftCard(tokenId, msg.sender, value, CardStatus.Minted);
        emit CardMinted(tokenId, msg.sender, value);
        return tokenId;
    }

    // 运营方发行礼品卡NFT
    function issueGiftCard(uint256 tokenId) public onlyOwner {
        require(giftCards[tokenId].status == CardStatus.Minted, "Card is not in Minted status");
        giftCards[tokenId].status = CardStatus.Issued;
        emit CardIssued(tokenId);
    }

    // 交易礼品卡NFT
    function tradeGiftCard(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner of the card");
        require(giftCards[tokenId].status == CardStatus.Issued, "Card is not in Issued status");
        _transfer(msg.sender, to, tokenId);
        emit CardTraded(tokenId, msg.sender, to);
    }

    // 兑换礼品卡NFT
    function redeemGiftCard(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner of the card");
        require(giftCards[tokenId].status == CardStatus.Issued, "Card is not in Issued status");
        giftCards[tokenId].status = CardStatus.Redeemed;
        emit CardRedeemed(tokenId);
    }

    // 销毁礼品卡NFT
    function burnGiftCard(uint256 tokenId) public onlyOwner {
        require(giftCards[tokenId].status == CardStatus.Redeemed, "Card is not in Redeemed status");
        _burn(tokenId);
        emit CardBurned(tokenId);
    }

    // 暂停流通
    function pauseTrading() public onlyOwner {
        _pause();
    }

    // 恢复流通
    function resumeTrading() public onlyOwner {
        _unpause();
    }

    // 设置账户类型
    function setAccountType(address account, AccountType accountType) public onlyOwner {
        accountTypes[account] = accountType;
    }

    // 覆盖函数以支持暂停
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!paused(), "Token transfers are paused");
    }
}
```

接下来我将简要介绍智能合约所实现的功能：

**事件类**： 事件Event是一种solidity编程语言中的特殊功能，浅说的话就是用来对某些事件留下可以被追踪的痕迹。在我写的合约中有这些事件：

1. 运营方赋予某个用户“卖方”的身份（否则默认是消费者）
2. 运营方允许“卖家”正式发行NFT
3. 运营方拒绝“卖家”发行NFT
4. 卖家铸造自己的NFT(然后等待运营方审批)
5. NFT被交易事件(卖家->消费者A；消费者A->消费者B)
6. NFT被兑换事件
7. NFT被暂停流通事件
8. NFT被销毁事件
9. 创世块运营方公示事件
10. 后续添加运营方事件

**函数类**： 函数类是具体功能实现的细则，需要用solidity编程基础 不做过多介绍，看得懂代码的也可以来问我。


**总结业务逻辑1.0版本：**

首先关于“鲜享链”的商业逻辑参考此视频：[B站视频：蟹卡](https://www.bilibili.com/video/BV1684y1R74f/?spm_id_from=333.337.search-card.all.click&vd_source=8d13c5e58b1f1c8013399c435abd77b3https:/)

区块链测试网络中的所有用户，会被分为3种类型：运营方、消费者、卖家

首先运营方是我代码里预先指定的，只有1～2位(暂定)。可以后续添加，运营方是谁，他做了什么，会在智能合约里通过事件被公开。运营方的权能、职责：

1. 管理用户的身份，赋予、撤销卖家身份。
2. 消费者无法被运营方删除、撤销等
3. 审核并决定是否同意卖家发行礼品卡NFT，会被公示
4. 审核是否暂停高风险的礼品卡NFT，会被公示

卖家经过运营方审核后获得身份，可以铸造NFT，是交易的源头。权能：

1. 铸造NFT，等待审批后才能发行
2. 被允许发行的NFT交易给消费者
3. 对消费者要求兑换的礼品卡NFT进行兑换（兑换后自动暂停该NFT的流通）
4. 交易NFT(等同于消费者)

消费者：

1. 购买、交易NFT
2. 对礼品卡NFT进行兑换
3. 兑换后进行评价
4. 可以在链上动态页面看到区块链的动态
