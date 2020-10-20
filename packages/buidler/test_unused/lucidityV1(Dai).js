const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi: abiToken } = require("../artifacts/SecurityToken.json");
const { abi: abiEscrow } = require("../artifacts/HolderContract.json");

use(solidity);

//make sure you have 'npx buidler node' running
describe("Lucidity Full Feature Test", function () {
  let Dai, HolderFactory, TokenFactory, CT;

  it("deploy contracts", async function () {
    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    const TokenFactoryContract = await ethers.getContractFactory(
      "TokenFactory"
    ); //contract name here
    TokenFactory = await TokenFactoryContract.connect(bidder).deploy();

    const HolderFactoryContract = await ethers.getContractFactory(
      "HolderFactory"
    ); //contract name here
    HolderFactory = await HolderFactoryContract.deploy();

    const CTContract = await ethers.getContractFactory("ConditionalTokens"); //contract name here
    CT = await CTContract.deploy();

    //use USDC on testnet/mainnet
    const DaiContract = await ethers.getContractFactory("Dai"); //contract name here
    Dai = await DaiContract.connect(funder).deploy(ethers.BigNumber.from("0"));
    await Dai.connect(funder).mint(funder.getAddress(),ethers.BigNumber.from("100"))
    
    const daibalance = await Dai.balanceOf(funder.getAddress());
    console.log("funder address: ", await funder.getAddress());
    console.log("funder balance of Dai: ", daibalance.toString());
  });

  it("deploy first escrow and project (Called from openlaw)", async function () {
    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //deploy escrow
    await HolderFactory.connect(bidder).deployNewHolder(
      "Honduras Agriculture Project",
      CT.address,
      Dai.address,
      owner.getAddress(),
      bidder.getAddress(),
      auditor.getAddress(),
      ethers.BigNumber.from("500"),
      ethers.BigNumber.from("36"),
      ethers.BigNumber.from("300"),
      ethers.BigNumber.from("32"),
      ethers.BigNumber.from("800"),
      ethers.BigNumber.from("24"),
    );

    const escrow = await HolderFactory.getHolder("Honduras Agriculture Project");

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      owner
    );
    console.log("Project Name: ", await firstEscrow.projectName())
    const budgets = await firstEscrow.budgetsOne()
    console.log(`budgets: ${budgets.toString()} dai`)
    const timeline = await firstEscrow.timelineOne()
    console.log(`timeline: ${timeline.toString()} months`)

    //deploy project
    await TokenFactory.connect(bidder).deployNewProject(
      "Honduras Agriculture Project",
      "AT",
      "linkhere",
      Dai.address,
      owner.getAddress(),
      bidder.getAddress(),
      auditor.getAddress()
    );

    const project = await TokenFactory.getProject("Honduras Agriculture Project");

    const firstProjectContract = new ethers.Contract(
      project.projectAddress,
      abiToken,
      owner
    );

    await firstProjectContract.connect(owner).setHolder(
      escrow.projectAddress);
  
    console.log("Dai address: ", Dai.address);
    console.log("CT address: ", CT.address);
    console.log("firsEscrow address: ", firstEscrow.address);
    console.log("firstProjectContract address: ", firstProjectContract.address);
    
    expect(
      (await firstProjectContract.projectName()) == "Honduras Agriculture Project",
      "project did not get init correctly"
    );
  });

  it("sell first coin and send ERC20 funds to holder contract", async function () {
    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //get first escrow and project contract again
    const escrow = await HolderFactory.getHolder("Honduras Agriculture Project");

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      ethers.getDefaultProvider()
    );

    const project = await TokenFactory.getProject("Honduras Agriculture Project");

    const firstProjectContract = new ethers.Contract(
      project.projectAddress,
      abiToken,
      ethers.getDefaultProvider()
    );

    //funder approve, then call recieve from project
    await Dai.connect(funder).approve(
      firstProjectContract.address, //spender, called by owner
      ethers.BigNumber.from("10")
    );

    const allowedTransfer = await Dai.allowance(
      funder.getAddress(), //owner
      firstProjectContract.address //spender
    );
    console.log(
      "How much dai will be transferred to project to mint token 1: ",
      allowedTransfer.toString()
    );

    //buy and mint first funding token
    await firstProjectContract.connect(funder).buyOne(
      ethers.BigNumber.from("10"), //funded value dai
      ethers.BigNumber.from("7") // tenor
    );

    //recieve the funding into the holder
    await firstEscrow
      .connect(funder) //anyone can call this, idk why it won't call by itself. Pay for gas fees?
      .recieveERC20(firstProjectContract.address, ethers.BigNumber.from("10"));

    ///run it all again
    
    //funder approve, then call recieve from project
    await Dai.connect(funder).approve(
      firstProjectContract.address, //spender, called by owner
      ethers.BigNumber.from("10")
    );

    const allowedTransfer2 = await Dai.allowance(
      funder.getAddress(), //owner
      firstProjectContract.address //spender
    );
    console.log(
      "How much dai will be transferred to project to mint token 2: ",
      allowedTransfer2.toString()
    );

    //buy and mint second funding token
    await firstProjectContract.connect(funder).buyOne(
      ethers.BigNumber.from("10"), //funded value dai
      ethers.BigNumber.from("7") // tenor
    );

    //recieve the funding into the holder
    await firstEscrow
      .connect(funder) //anyone can call this, idk why it won't call by itself. Pay for gas fees?
      .recieveERC20(firstProjectContract.address, ethers.BigNumber.from("10"));

    const daibalance = await Dai.balanceOf(funder.getAddress());
    console.log("funder balance of Dai: ", daibalance.toString());

    const daibalance2 = await Dai.balanceOf(firstEscrow.address);
    console.log("escrow balance of Dai: ", daibalance2.toString());

    console.log(
      "Holder of minted token: ",
      await firstProjectContract
        .connect(funder)
        .ownerOf(ethers.BigNumber.from("0"))
    );
    
    expect(
      (await firstProjectContract
        .connect(funder)
        .ownerOf(ethers.BigNumber.from("0"))) == (await funder.getAddress()),
      "mint didn't work"
    );
  });

  it("run through Gnosis conditional token and audit report as oracle", async function () {
    //run a for loop through this later? optimize later. 

    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //escrow acts as oracle here
    const escrow = await HolderFactory.getHolder("Honduras Agriculture Project");

    const firstEscrow = new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      ethers.getDefaultProvider()
    );

    //questionId->conditionId->outcome slots->CollectionId (of different outcomes)->positionId(tying collateral type)->split to stake
    //1) run getConditionId() and prepareCondition() with same parameters, Auditor should be address of oracle.
    //0x0000000000000000000000000000000000000000000000000000000000000001 as question id (second parameter), can have a few outcomes for failed, passed, ambigious
    const conditionOne = await CT.connect(bidder).getConditionId(
      firstEscrow.address,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      2
    );
    await CT.connect(bidder).prepareCondition(
      firstEscrow.address,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      2
    );

    //2) check with getOutcomeSlotCount() with the return of getConditionId() to check it ran correctly.
    //bit arrays (binary) are for storing outcomes. 0b001 == 1, 0b010 == 2, 0b011 == 3, 0b100 == 4, 0b101 == 5, 0b111 == 6. So now a uint256 can store 256 different bits.
    //3) Say 3 outcome slots, A, B, C we want to use it test inclusion in a set.
    //                        0, 1, 1 -> 0b110 -> 6 now run getCollectionId (0x00000...,conditionId, 6). If only A is true (1,0,0) this becomes 0b001, which is now 1.
    //                        another example of index set values for outcome slots: lo, hi (1,0) -> 0b01 -> 1. (0,1) -> 0b10 -> 2.
    const ApproveMilestoneOne = await CT.connect(bidder).getCollectionId(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionOne,
      1 //0b01
    );

    const RejectMilestoneOne = await CT.connect(bidder).getCollectionId(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionOne,
      2 //0b10
    );
    //4) collateral is set with getPositionId(collateral address (dai), collectionId). this is setting the type of collateral, not amount yet. This is also the ERC1155 unique identification for this token!
    const ApprovalOnePosition = await CT.connect(bidder).getPositionId(
      Dai.address,
      ApproveMilestoneOne
    );
    const RejectOnePosition = await CT.connect(bidder).getPositionId(
      Dai.address,
      RejectMilestoneOne
    );
    //5) set spender approval set to conditionaltoken contract address (already set in our case)
    //6) split position (most important step) is called by address with the collateral (collateralToken (address of dai), parentCollectionId (all 0's 32 bytes), conditionId from 1, partition (outcome slots index set value, so [6,1], amount (value/# of tokens to take))
    //now the CT is holding the collateral and address the held the collateral now holds the CT. You can now use balanceOf(address (so project address), positionId) where positionId is from step 4 to figure out how many CT for each position (outcome) you are holding.
    const allowedTransfer = await Dai.allowance(
      firstEscrow.address, //owner
      CT.address //spender
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
        ethers.BigNumber.from("10")
      );

    const daibalance = await Dai.balanceOf(CT.address);
    console.log("CT balance of Dai: ", daibalance.toString());

    const CTbalance = await CT.balanceOf(
      firstEscrow.address,
      ApprovalOnePosition
    );
    console.log(
      "Escrow balance of CT in Approved Condition: ",
      CTbalance.toString()
    );

    //transfer to bidder, must be called by bidder
    await firstEscrow.connect(bidder).transferCTtoBidder(ApprovalOnePosition);

    const CTbalanceBidder = await CT.balanceOf(
      bidder.getAddress(),
      ApprovalOnePosition
    );
    console.log(
      "Bidder balance of CT in Approved Condition after transfer: ",
      CTbalanceBidder.toString()
    );

    const CTbalanceAfter = await CT.balanceOf(
      firstEscrow.address,
      ApprovalOnePosition
    );
    console.log(
      "Escrow balance of CT in Approved Condition after transfer: ",
      CTbalanceAfter.toString()
    );
    const CTbalanceAfter2 = await CT.balanceOf(
        firstEscrow.address,
        RejectOnePosition
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
        [ethers.BigNumber.from("1"), ethers.BigNumber.from("0")]
      );
    console.log("audit passed, result sent");

    //9) redemption with redeemPositions(dai,parent(all 0's again), conditionId, indexset (outcome slots as index set so [1,0,0] is 0)). CT now get burned.
    await CT.connect(bidder).redeemPositions(
      Dai.address,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      conditionOne,
      [ethers.BigNumber.from("1")]
    );

    const daibalanceend = await Dai.balanceOf(bidder.getAddress());
    console.log(
      "Bidder balance of Dai after redemption: ",
      daibalanceend.toString()
    );
    //escrow needs a redemption function

    //cheers you're done for now! :) Implement payback system later, where either the escrow redeems and has to return ERC20 to token contract, or bidder sends ERC20 back. 
  });
});
