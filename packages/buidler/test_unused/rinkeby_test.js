const { ethers } = require("@nomiclabs/buidler");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { abi: abiToken } = require("../artifacts/SecurityToken.json");
const { abi: abiFactory } = require("../artifacts/TokenFactory.json");
const fs = require("fs");

use(solidity);

function mnemonic() {
  return fs.readFileSync("./mnemonic.txt").toString().trim();
}

//make sure you have 'npx buidler node' running
describe("Lucidity Full Feature Test", function () {
  let dai, HolderContract, TokenFactory, CT;

  it("deploy first project (Called from openlaw)", async function () {
    const abi = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      // Authenticated Functions
      "function transfer(address to, uint amount) returns (boolean)",

      // Events
      "event Transfer(address indexed from, address indexed to, uint amount)",
    ];

    // This can be an address or an ENS name
    const address = "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735"; //address dai

    // An example Provider, "homestead" is mainnet
    const provider = ethers.getDefaultProvider("rinkeby", {
      infura: "d635ea6eddda4720824cc8b24380e4a9",
    });

    dai = new ethers.Contract(address, abi, provider);

    let [bidder, auditor, funder] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each
    owner = ethers.Wallet.fromMnemonic(mnemonic());
    owner = await owner.connect(provider);
    const balance_owner = await owner.getBalance();
    const balancedai_owner = await dai.balanceOf(owner.address);

    //console.log("eth held in wei: ", balance_owner.toString());
    //console.log("dai held: ", balancedai_owner.toString());

    const TokenFactoryContract = await ethers.getContractFactory(
      "TokenFactory"
    ); //contract name here
    TokenFactory = await TokenFactoryContract.connect(owner).deploy();

    console.log(TokenFactory);

    //shoulder holder be made first? with CT address ofc
    //then deploy project
    //then buyone should be transfer instead,
    /*
    //const minter_role = await ProjectNFT.MINTER_ROLE();
    const agriProject = await TokenFactory.connect(owner).deployNewProject(
      "AgriTest",
      "AT",
      "linkhere",
      owner.getAddress(),
      bidder.getAddress(),
      auditor.getAddress()
    );

    const projectData = await TokenFactory.getProject("AgriTest");

    const firstProjectContract = new ethers.Contract(
      projectData.owner,
      abiToken,
      owner
    );
    expect(
      (await firstProjectContract.projectName()) == "AgriTest",
      "project did not get init correctly"
    );
    */

    //https://solidity-by-example.org/0.6/app/erc20/ move ERC into contrac then out into holder
    //implement CT stuff T-T
  });
});
