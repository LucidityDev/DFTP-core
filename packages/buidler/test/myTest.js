const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi } = require("../artifacts/SecurityToken.json");

use(solidity);
//make sure you have 'npx buidler node' running
describe("Lucidity Full Feature Test", function () {
  let TokenExchange, TokenFactory, CT, AAVEvault;
  const INITIAL_NFT_PRICE = ethers.utils.parseUnits("3", "ether");

  it("deploy contracts", async function () {
    const [owner, bidder, auditor, AAVEfunder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    /*
    const AAVEvaultContract = await ethers.getContractFactory(
      "AaveCollateralVault"
    ); //contract name here
    AAVEvault = await AAVEvaultContract.deploy();
    */

    /*
    const TokenExchangeContract = await ethers.getContractFactory(
      "TokenExchange"
    ); //contract name here
    TokenExchange = await TokenExchangeContract.deploy();
    */

    const TokenFactoryContract = await ethers.getContractFactory(
      "TokenFactory"
    ); //contract name here
    TokenFactory = await TokenFactoryContract.connect(bidder).deploy();

    const CTContract = await ethers.getContractFactory("ConditionalTokens"); //contract name here
    CT = await CTContract.deploy();
  });

  it("deploy first project (Called from openlaw)", async function () {
    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //const minter_role = await ProjectNFT.MINTER_ROLE();
    const agriProject = await TokenFactory.connect(owner).deployNewProject(
      "AgriTest",
      "AT",
      "linkhere",
      owner.getAddress(),
      bidder.getAddress(),
      auditor.getAddress()
    );

    const projectData = await TokenFactory.getProject(
      ethers.BigNumber.from("0")
    );

    const firstProjectContract = new ethers.Contract(
      projectData.owner,
      abi,
      owner
    );
    expect(
      (await firstProjectContract.projectName()) == "AgriTest",
      "project did not get init correctly"
    );
  });

  //multisig safe factory create with new project
  xit("create multisig", async function () {});

  it("sell firstCoin", async function () {
    const [owner, bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

    //get first project contract again
    const projectData = await TokenFactory.getProject(
      ethers.BigNumber.from("0")
    );

    const firstProjectContract = new ethers.Contract(
      projectData.owner,
      abi,
      owner
    );

    //https://github.com/ethers-io/ethers.js/issues/563
    let overrides = {
      value: ethers.utils.parseEther("1.0"),
    };

    //buy and mint first funding token
    await firstProjectContract.connect(funder).buyOne(
      ethers.utils.parseEther("1.0"), //funded value
      ethers.BigNumber.from("7"), //tenor
      overrides
    );

    expect(
      firstProjectContract.ownerOf(ethers.BigNumber.from("0")) ==
        funder.getAddress(),
      "buyOne() didn't work"
    );
  });

  //conditional token with multisig as oracle
  //auditor multisig sign
  //send to bidder wallet :)

  //test on rinkeby?
});
