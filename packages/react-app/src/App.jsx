import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { INFURA_ID, ETHERSCAN_KEY } from "./constants";
// blockchain libs
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getDefaultProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useUserAddress } from "eth-hooks";
// ui libs
import Web3Modal from "web3modal";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

// common libs
import { Header, Account, Body } from "./components";
import { useExchangePrice,  useUserProvider} from "./hooks";
// assets
import "antd/dist/antd.css";
import "./App.css";

//added stuff
import { ethers } from "ethers";
import { Buttons } from "./components/mainComponents/funderButtons"
import { useForm } from "react-hook-form";

import { HomePage } from "./components/pages/HomePage"
import { FunderPage } from "./components/pages/FunderPage"
import { OwnerPage } from "./components/pages/OwnerPage"
import { AuditorPage } from "./components/pages/AuditorPage"
import { BidderPage } from "./components/pages/BidderPage"

const { abi: abiToken } = require("./abis/SecurityToken.json");
const { abi: abiEscrow } = require("./abis/HolderContract.json");
const { abi: abiTokenF } = require("./abis/TokenFactory.json");
const { abi: abiEscrowF } = require("./abis/HolderFactory.json");
const { abi: abiDai } = require("./abis/Dai.json");
const { abi: abiCT } = require("./abis/ConditionalTokens.json");


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
//

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  console.log("Location:", window.location.pathname)

  // const [route, setRoute] = useState();
  // useEffect(() => {
  //   console.log("SETTING ROUTE", window.location.pathname)
  //   setRoute(window.location.pathname)
  // }, [window.location.pathname]);
  
  //not part of scaffold-eth
  const [firstEscrow, setEscrow] = useState([]);
  const [firstProjectContract, setProject] = useState([]);
  const { register, handleSubmit } = useForm(); //for project name submission

  //initial links
  let Dai = new ethers.Contract(
    "0x5D49B56C954D11249F59f03287619bE5c6174879",
    abiDai,
    userProvider
  );

  let CT = new ethers.Contract(
    "0xaB2d7Ca5361B1f8E944543063d63098589bdcD1B",
    abiCT,
    userProvider
  );

  let HolderFactory = new ethers.Contract(
    "0x057F0ea335ADBeF55e66F9ddeE98Bc53D45dFFD1",
    abiEscrowF,
    userProvider
  );

  let TokenFactory = new ethers.Contract(
    "0x83Fbd04ccce2AeDd94E8e9783De26FE5D5D8a26B",
    abiTokenF,
    userProvider
  );

  //update after project name search
  const updateContracts = async (formData) => {
    console.log("searching project name: ", formData.value)
    const escrow = await HolderFactory.getHolder(formData.value);

    setEscrow(new ethers.Contract(
      escrow.projectAddress,
      abiEscrow,
      userProvider
    ))

    const project = await TokenFactory.getProject(formData.value);

    setProject(new ethers.Contract(
      project.projectAddress,
      abiToken,
      userProvider
    ))

    console.log("project and escrow linked");
  }

  //roles dropdown
  const [PageState, setPage] = useState([<HomePage />])
  const handleSelect=(e)=>{
    console.log(`${e} has been selected`);
    if (e=="FunderPage") {
      setPage(<FunderPage 
        address={address} 
        provider ={userProvider} 
        firstEscrow = {firstEscrow}
        firstProjectContract = {firstProjectContract}
        Dai = {Dai}/>)
    }
    if (e=="BidderPage") {
      setPage(<BidderPage 
        address={address} 
        provider ={userProvider} 
        firstEscrow = {firstEscrow}
        firstProjectContract = {firstProjectContract}
        Dai = {Dai}
        CT={CT}/>)
    }
    if (e=="AuditorPage") {
      setPage(<AuditorPage 
        address={address} 
        provider ={userProvider} 
        firstEscrow = {firstEscrow}
        firstProjectContract = {firstProjectContract}
        Dai = {Dai}
        CT={CT}/>)
    }
    if (e=="OwnerPage") {
      setPage(<OwnerPage />)
    }
  }

  //openlaw link
  const link = <a href="https://lib.openlaw.io/web/default/template/LucidityRFP"> fill out RFP first</a>;   

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header>
        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </Header>
      <Body>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              {/*
                  🎛 this scaffolding is full of commonly used components
                  this <Contract/> component will automatically parse your ABI
                  and give you a form to interact with it locally
              */}
              {/* <Contract
                name="YourContract"
                signer={userProvider.getSigner()}
                provider={localProvider}
                address={address}
                blockExplorer={blockExplorer}
              /> */}
              <Container fluid="md">
                <Row className="mt-1">
                    <Col>
                    <Card>
                      <div>
                        <h5>Welcome, please select a role in the dropdown to get started. This can be changed anytime.</h5>
                          <Dropdown onSelect={handleSelect} size="sm">
                            <Dropdown.Toggle variant="success" id="dropdown-basic" size="sm">
                              Roles
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item eventKey="OwnerPage">Owner</Dropdown.Item>
                              <Dropdown.Item eventKey="FunderPage">Funder</Dropdown.Item>
                              <Dropdown.Item eventKey="AuditorPage">Auditor</Dropdown.Item>
                              <Dropdown.Item eventKey="BidderPage">Bidder</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                      </div>
                      </Card>
                      <Card className="mt-1">
                      <h6 classname="mt-1">Please {link} for new projects, otherwise search for project name below:</h6>
                        <form onSubmit={handleSubmit(updateContracts)}>
                          <label>
                            <input type="text" name="value" ref={register} />
                          </label>
                          <input type="submit" value="Submit" />
                        </form>
                        {PageState}
                      </Card>
                      <Card className="mt-1">
                        <div>List of all Projects and Funders coming soon...</div>
                      </Card>
                  </Col>
                </Row>
              </Container>
                <div className="fixed-bottom">
                  <h5 style={{color: "black"}}>Wallet faucet here</h5>
                  <Buttons 
                    address={address} 
                    provider ={userProvider} 
                    firstEscrow = {firstEscrow}
                    firstProjectContract = {firstProjectContract}
                    Dai = {Dai}/>
                </div>
            </Route>
          </Switch>
        </BrowserRouter>
      </Body>
    </div >
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

export default App;
