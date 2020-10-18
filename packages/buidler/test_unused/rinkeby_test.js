const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi: abiToken } = require("../artifacts/SecurityToken.json");
const { abi: abiFactory } = require("../artifacts/TokenFactory.json");
const { abi: abiHolder } = require("../artifacts/HolderFactory.json");
const { abi: abiHolderC } = require("../artifacts/HolderContract.json");
const { abi: abiCT } = require("../artifacts/ConditionalTokens.json");
const { abi: abiDai } = require("../artifacts/Dai.json")
const fs = require("fs");

use(solidity);

function mnemonic() {
  return fs.readFileSync("./mnemonic.txt").toString().trim();
}

//make sure you have 'npx buidler node' running
describe("Rinkeby Deploy and Test", function () {
  let Dai, HolderFactory, TokenFactory, CT, provider, owner, overrides;

  it("deploy first project and escrow", async function () {
    
    provider = new ethers.providers.InfuraProvider("rinkeby", {
      projectId: "d635ea6eddda4720824cc8b24380e4a9",
      projectSecret: "b4ea2b15f0614105a64f0e8ba1f2bffa"
  });

    // This can be an address or an ENS name
    const address = "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735"; //address dai

    Dai = new ethers.Contract(address, abiDai, provider);

    owner = ethers.Wallet.fromMnemonic(mnemonic());
    owner = await owner.connect(provider);
    const balance_owner = await owner.getBalance();
    const balancedai_owner = await Dai.balanceOf(owner.address);

    console.log("eth held in wei: ", balance_owner.toString());
    console.log("dai held: ", balancedai_owner.toString());
    // const TokenFactoryContract = await ethers.getContractFactory(
    //   "TokenFactory"
    // ); //contract name here
    // TokenFactory = await TokenFactoryContract.connect(owner).deploy();

    TokenFactory = new ethers.Contract("0x7b5D3915bb88ca0E560F86f7aBB44b69946D2FB1", abiFactory, provider);
    console.log("Token Factory: ", TokenFactory.address)

    // const HolderFactoryContract = await ethers.getContractFactory(
    //   "HolderFactory"
    // ); //contract name here
    // HolderFactory = await HolderFactoryContract.connect(owner).deploy();

    HolderFactory = new ethers.Contract("0xdd67Fff3e64522d7Fd3534EDD783B0CA6618b949", abiHolder, provider);
    console.log("Escrow Factory: ", HolderFactory.address)

    //https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
    overrides = {
      gasLimit: ethers.BigNumber.from("9500000"),
    };

    //deploy escrow
    // await HolderFactory.connect(owner).deployNewHolder(
    //   "AgriTest",
    //   "0x36bede640D19981A82090519bC1626249984c908", //CT address on rinkeby
      // Dai.address,
      // owner.getAddress(),
      // bidder.getAddress(),
      // auditor.getAddress(),
      // [ethers.BigNumber.from("300"),ethers.BigNumber.from("600"),ethers.BigNumber.from("900")],
      // [ethers.BigNumber.from("3"),ethers.BigNumber.from("6"),ethers.BigNumber.from("9")],
      // overrides
    // );

    const escrow = new ethers.Contract("0x32530d25E0448E7B0da28B80a778613f8A02adB6", abiHolderC, provider);
    console.log("(old) First Escrow: ", escrow.address)

    // // //deploy project
    // // await TokenFactory.connect(owner).deployNewProject(
    // //   "AgriTest",
    // //   "AT",
    // //   "linkhere",
    // //   Dai.address,
    // //   owner.getAddress(),
    // //   bidder.getAddress(),
    // //   auditor.getAddress(),
    // //   overrides
    // // );

    const project = new ethers.Contract("0xE6a9cf47cA7e6692a6c27EB0D59e857C5b160E86", abiToken, provider);
    console.log("(old) First Token/Project: ", project.address)
    await project.connect(owner).setHolder(
    escrow.projectAddress);

    CT = new ethers.Contract("0x36bede640D19981A82090519bC1626249984c908",abiCT,provider)
    console.log("CT address: ", CT.address);

    const getProject = await TokenFactory.connect(owner).getProject("AgriTest");
    console.log(getProject);
  });

  xit("test buyone()", async function () {
    const [bidder, auditor] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each
    
    const firstEscrow = new ethers.Contract("0x32530d25E0448E7B0da28B80a778613f8A02adB6", abiHolderC, provider);
    const firstProjectContract = new ethers.Contract("0xE6a9cf47cA7e6692a6c27EB0D59e857C5b160E86", abiToken, provider);
    
    // funder approve, then call recieve from project
    await Dai.connect(owner).approve(
      firstProjectContract.address, //spender, called by owner
      ethers.BigNumber.from("5")
    );

    const allowedTransfer = await Dai.connect(owner).allowance(
      owner.getAddress(), //owner
      firstProjectContract.address //spender
    );
    console.log(
      "How much Dai will be transferred to project to mint token (allowance): ",
      allowedTransfer.toString()
    );

    // //buy and mint first funding token
    // await firstProjectContract.connect(owner).buyOne(
    //   ethers.BigNumber.from("5"), //funded value dai
    //   ethers.BigNumber.from("5"), // tenor
    //   overrides
    // );

    // //recieve the funding into the holder
    // await firstEscrow
    //   .connect(owner) //anyone can call this, idk why it won't call by itself. Pay for gas fees?
    //   .recieveERC20(firstProjectContract.address, ethers.BigNumber.from("3"));

    // const daibalance = await Dai.balanceOf(owner.getAddress());
    // console.log("funder balance of Dai: ", daibalance.toString());

    // const daibalance2 = await Dai.balanceOf(firstEscrow.address);
    // console.log("escrow balance of Dai: ", daibalance2.toString());

    // console.log(
    //   "Holder of minted token: ",
    //   await firstProjectContract
    //     .connect(owner)
    //     .ownerOf(ethers.BigNumber.from("0"))
    // );

    //give bidder and auditor some money for gas
    // tx = {
    //   to: bidder.getAddress(),
    //   value: ethers.utils.parseEther("1.0"),
    // };
    // await owner.signTransaction(tx);
    // await owner.sendTransaction(tx);

    const balance_bidder = await bidder.getBalance();
    console.log("eth held in wei by bidder: ", balance_bidder.toString());

    // tx = {
    //   to: auditor.getAddress(),
    //   value: ethers.utils.parseEther("1.0"),
    // };
    // await owner.signTransaction(tx);
    // await owner.sendTransaction(tx);

    const balance_auditor = await auditor.getBalance();
    console.log("eth held in wei by auditor: ", balance_auditor.toString());
  });
   
  xit("run through Gnosis conditional token and audit report as oracle", async function () {
    //run a for loop through this later? optimize later. 

    const [bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //escrow acts as oracle here
    const escrow = await HolderFactory.getHolder("AgriTest");

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiHolderC,
      ethers.getDefaultProvider()
    );

    //questionId->conditionId->outcome slots->CollectionId (of different outcomes)->positionId(tying collateral type)->split to stake
    //1) run getConditionId() and prepareCondition() with same parameters, Auditor should be address of oracle.
    //0x0000000000000000000000000000000000000000000000000000000000000001 as question id (second parameter), can have a few outcomes for failed, passed, ambigious
    const conditionOne = await CT.connect(bidder).getConditionId(
      firstEscrow.address,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      2,
      overrides
    );
    await CT.connect(bidder).prepareCondition(
      firstEscrow.address,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      2,
      overrides
    );

    //2) check with getOutcomeSlotCount() with the return of getConditionId() to check it ran correctly.
    //bit arrays (binary) are for storing outcomes. 0b001 == 1, 0b010 == 2, 0b011 == 3, 0b100 == 4, 0b101 == 5, 0b111 == 6. So now a uint256 can store 256 different bits.
    //3) Say 3 outcome slots, A, B, C we want to use it test inclusion in a set.
    //                        0, 1, 1 -> 0b110 -> 6 now run getCollectionId (0x00000...,conditionId, 6). If only A is true (1,0,0) this becomes 0b001, which is now 1.
    //                        another example of index set values for outcome slots: lo, hi (1,0) -> 0b01 -> 1. (0,1) -> 0b10 -> 2.
    const ApproveMilestoneOne = await CT.connect(bidder).getCollectionId(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionOne,
      1, //0b01
      overrides
    );

    const RejectMilestoneOne = await CT.connect(bidder).getCollectionId(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionOne,
      2, //0b10
      overrides
    );
    //4) collateral is set with getPositionId(collateral address (dai), collectionId). this is setting the type of collateral, not amount yet. This is also the ERC1155 unique identification for this token!
    const ApprovalOnePosition = await CT.connect(bidder).getPositionId(
      Dai.address,
      ApproveMilestoneOne,
      overrides
    );
    const RejectOnePosition = await CT.connect(bidder).getPositionId(
      Dai.address,
      RejectMilestoneOne,
      overrides
    );
    //5) set spender approval set to conditionaltoken contract address (already set in our case)
    //6) split position (most important step) is called by address with the collateral (collateralToken (address of dai), parentCollectionId (all 0's 32 bytes), conditionId from 1, partition (outcome slots index set value, so [6,1], amount (value/# of tokens to take))
    //now the CT is holding the collateral and address the held the collateral now holds the CT. You can now use balanceOf(address (so project address), positionId) where positionId is from step 4 to figure out how many CT for each position (outcome) you are holding.
    const allowedTransfer = await Dai.allowance(
      firstEscrow.address, //owner
      CT.address, //spender
      overrides
    );
    console.log(
      "How much dai will be staked on conditional token: ",
      allowedTransfer.toString()
    );

    await firstEscrow
      .connect(bidder)
      .callSplitPosition(
        Dai.address,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        conditionOne,
        [1, 2],
        ethers.BigNumber.from("1"),
        overrides
      );

    const daibalance = await Dai.balanceOf(CT.address);
    console.log("CT balance of Dai: ", daibalance.toString());

    const CTbalance = await CT.balanceOf(
      firstEscrow.address,
      ApprovalOnePosition,
      overrides
    );
    console.log(
      "Escrow balance of CT in Approved Condition: ",
      CTbalance.toString()
    );

    //transfer to bidder, must be called by bidder
    await firstEscrow.connect(bidder).transferCTtoBidder(ApprovalOnePosition);

    const CTbalanceBidder = await CT.balanceOf(
      bidder.getAddress(),
      ApprovalOnePosition,
      overrides
    );
    console.log(
      "Bidder balance of CT in Approved Condition after transfer: ",
      CTbalanceBidder.toString()
    );

    const CTbalanceAfter = await CT.balanceOf(
      firstEscrow.address,
      ApprovalOnePosition,
      overrides
    );
    console.log(
      "Escrow balance of CT in Approved Condition after transfer: ",
      CTbalanceAfter.toString()
    );
    const CTbalanceAfter2 = await CT.balanceOf(
        firstEscrow.address,
        RejectOnePosition,
        overrides
      );
      console.log(
        "Escrow balance of CT in Rejected Condition after transfer: ",
        CTbalanceAfter2.toString()
      );

    //8) reportpayout() is called only by oracle address, with (questionId, outcome slots [1,0,0]) not sure where outcome slots are tied to addresses?
    await firstEscrow
      .connect(auditor)
      .callReportPayouts(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        [ethers.BigNumber.from("1"), ethers.BigNumber.from("0")],
        overrides
      );
    console.log("audit passed, result sent");

    //9) redemption with redeemPositions(dai,parent(all 0's again), conditionId, indexset (outcome slots as index set so [1,0,0] is 0)). CT now get burned.
    await CT.connect(bidder).redeemPositions(
      Dai.address,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionOne,
      [ethers.BigNumber.from("1")],
      overrides
    );

    const daibalanceend = await Dai.balanceOf(bidder.getAddress());
    console.log(
      "Bidder balance of Dai after redemption: ",
      daibalanceend.toString()
    );
  })
});
