const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi: abiNeg } = require("../artifacts/ProjectNegotiationTracker.json");

use(solidity);

//make sure you have 'npx buidler node' running
describe("Openlaw negotiation test", function () {
  let OpenLawFactory;

  it("deploy contract from owner", async function () {
    const [owner, bidder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    const OpenLawFactoryContract = await ethers.getContractFactory(
      "ProjectTrackerFactory"
    ); //contract name here
    OpenLawFactory = await OpenLawFactoryContract.deploy();
    console.log("gas costs of deploy", OpenLawFactoryContract);

    console.log("terms proposed")
    //deploy project
    await OpenLawFactory.connect(owner).deployNewProject(
        owner.getAddress(),
        "AgriTest",
        "Milestone1, Milestone2, Milestone3",
        [ethers.BigNumber.from("3"),ethers.BigNumber.from("6"),ethers.BigNumber.from("9")],
        [ethers.BigNumber.from("300"),ethers.BigNumber.from("600"),ethers.BigNumber.from("900")]
      );

      const project = await OpenLawFactory.getProject("AgriTest");
      console.log(project)
  });

  it("initiate bid", async function () {
    const [owner, bidder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each
    const project = await OpenLawFactory.getProject("AgriTest");

    console.log("bidder address: ", await bidder.getAddress());

    const firstProjectContract = new ethers.Contract(
        project.projectAddress,
        abiNeg,
        owner
      );

    await firstProjectContract.connect(bidder).newBidderTerms(
        [ethers.BigNumber.from("4"),ethers.BigNumber.from("6"),ethers.BigNumber.from("9")],
        [ethers.BigNumber.from("400"),ethers.BigNumber.from("600"),ethers.BigNumber.from("900")])

    //frontend should just list different addresses of bidders?
    const bidderTerms = await firstProjectContract.connect(owner).loadBidderTerms(bidder.getAddress());
    console.log("bidder terms: ", bidderTerms);

    await firstProjectContract.connect(owner).approveBidderTerms(bidder.getAddress())
    console.log("bid approved");

    const winningBid = await firstProjectContract.winningBidder()
    console.log("winning bidder address: ", winningBid);
});
});
