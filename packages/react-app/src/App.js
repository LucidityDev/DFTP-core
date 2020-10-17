import React, { useCallback, useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { Web3Provider, getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import { web3Modal, logoutOfWeb3Modal } from './utils/web3Modal'
import logo from "./ethereumLogo.png";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

//added stuff
import { ethers } from "ethers";
import { Buttons } from "./components/funderButtons"
import { ConditionalButtons } from "./components/conditionalButtons"
import { useUserAddress } from "eth-hooks";
const { abi: abiToken } = require("./abis/SecurityToken.json");
const { abi: abiEscrow } = require("./abis/HolderContract.json");
const { abi: abiDai } = require("./abis/Dai.json");
const { abi: abiCT } = require("./abis/ConditionalTokens.json");

/* IMPORTANT STEPS TO TESTING 
1) Start node
2) Start react app
3) give self 1 ETH
4) run buidler test on frontend test script
5) change contract addresses below
6) update the ABI's recompiled in buidler to the react abi folder
7) click update balance, everything should work now. 
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
  const address = useUserAddress(provider);
  
  //link all contracts 
  
  const Dai = new ethers.Contract(
    "0x5D49B56C954D11249F59f03287619bE5c6174879",
    abiDai,
    provider
  );

  const CT = new ethers.Contract(
    "0xaB2d7Ca5361B1f8E944543063d63098589bdcD1B",
    abiCT,
    provider
  );

    const firstEscrow = new ethers.Contract(
    "0xa88d6E9AAE48f0bBD5e17c1bc6c76bDE9Ab51567",
    abiEscrow,
    provider
  );

  const firstProjectContract = new ethers.Contract(
    "0xFccc25BB40d52ab78b4736D4576D7ff594103C45",
    abiToken,
    provider
  );

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
