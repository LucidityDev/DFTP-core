import React, { useCallback, useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider, getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Header, Body, Button } from "./components";
import { web3Modal, logoutOfWeb3Modal } from './utils/web3Modal'
import logo from "./ethereumLogo.png";

import GET_TRANSFERS from "./graphql/subgraph";

//added stuff
import { ethers } from "ethers";
import { Buttons } from "./components/mainComponents/funderButtons"
import { ConditionalButtons } from "./components/mainComponents/conditionalButtons"
import { useUserAddress } from "eth-hooks";
import { useForm } from "react-hook-form";
const { abi: abiToken } = require("./abis/SecurityToken.json");
const { abi: abiEscrow } = require("./abis/HolderContract.json");
const { abi: abiTokenF } = require("./abis/TokenFactory.json");
const { abi: abiEscrowF } = require("./abis/HolderFactory.json");
const { abi: abiDai } = require("./abis/Dai.json");
const { abi: abiCT } = require("./abis/ConditionalTokens.json");
/* saving this here in case we want to deploy projects in a function/through UI later
import { waffle } from "@nomiclabs/buidler";

const { deployContract } = waffle;

const contract = deployContract(signer, BuidlerArtifact, [constructorArgs]);
*/

/* IMPORTANT STEPS FOR TESTING 
1) Start buidler node
2) Start react app
3) click give self 1 ETH
4) run buidler test on frontend test script (make sure your metamask mnemonic is saved in mnemonic.txt in buidler folder (and add to gitignore))
5) may have to change contract addresses below since we all have different metamask accounts. You will have to restart the app to relink them. 
6) may have to reset metamask account to sync nonce
7) click update balance, if this works then everything should work now. 
8) search for "AgriTest" to link those contracts
*/

function WalletButton({ provider, loadWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

//showing address
function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, setProvider] = useState();
  const [ethBalance, setEthBalance] = useState(["loading..."]);
  const [daiBalance, setDaiBalance] = useState([]);
  const [firstEscrow, setEscrow] = useState([]);
  const [firstProjectContract, setProject] = useState([]);
  const { register, handleSubmit } = useForm(); //for project name submission
  const address = useUserAddress(provider);
  
  //initial links
  let Dai = new ethers.Contract(
    "0x5D49B56C954D11249F59f03287619bE5c6174879",
    abiDai,
    provider
  );

  let CT = new ethers.Contract(
    "0xaB2d7Ca5361B1f8E944543063d63098589bdcD1B",
    abiCT,
    provider
  );

  let HolderFactory = new ethers.Contract(
    "0x057F0ea335ADBeF55e66F9ddeE98Bc53D45dFFD1",
    abiEscrowF,
    provider
  );

  let TokenFactory = new ethers.Contract(
    "0x83Fbd04ccce2AeDd94E8e9783De26FE5D5D8a26B",
    abiTokenF,
    provider
  );

  //update after project name search
  const updateContracts = async (formData) => {
    console.log("searching project name: ", formData.value)
    const escrow = await HolderFactory.getHolder(formData.value);

    setEscrow(new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      provider
    ))

    const project = await TokenFactory.getProject(formData.value);

    setProject(new ethers.Contract(
      project.projectAddress,
      abiToken,
      provider
    ))

    console.log("project and escrow linked");
  }

  /* Open wallet selection modal. */
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    setProvider(new Web3Provider(newProvider));
  }, []);

  /* If user has loaded a wallet before, load it automatically. */
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  React.useEffect(() => {
    if (!loading && !error && data && data.fundingvalue) {
      console.log({ fundingvalue: data.fundingvalue });
    }
  }, [loading, error, data]);


  //interaction functions
  const callValue = async () => {
    const owner = provider.getSigner();

    const dvalue = await Dai.balanceOf(address)
    setDaiBalance(`Dai held: ${dvalue.toString()}`)

    const evalue = await provider.getBalance(address)
    setEthBalance(` ETH held: ${evalue.toString()}`)

    setTimeout(callValue, 10000) //update every 10 seconds
  };
  
  //openlaw link
  const link = <a href="https://lib.openlaw.io/web/default/template/LucidityRFP"> click me</a>;   

  return (
    <div>
      <Header>
        {daiBalance}
        {ethBalance}
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} />
      </Header>
      <Body>
      <div>Please fill out RFP first: {link}.</div>
      <form onSubmit={handleSubmit(updateContracts)}>
        <label>
          Search for project name:
          <input type="text" name="value" ref={register} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <Buttons 
        address={address} 
        provider ={provider} 
        onCall = {callValue}
        firstEscrow = {firstEscrow}
        firstProjectContract = {firstProjectContract}
        Dai = {Dai}/>

      <div>
        <ConditionalButtons 
        address={address} 
        provider ={provider} 
        onCall = {callValue}
        firstEscrow = {firstEscrow}
        firstProjectContract = {firstProjectContract}
        Dai = {Dai}
        CT = {CT}/>
      </div>
        
      </Body>
    </div>
  );
}

export default App;
