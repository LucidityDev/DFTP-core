import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { INFURA_ID, ETHERSCAN_KEY } from "./constants";
// blockchain libs
import WalletConnectProvider from "@walletconnect/web3-provider";
import { getDefaultProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useUserAddress } from "eth-hooks";
// ui libs
import Web3Modal from "web3modal";
import { Button, Container, Row, Col, Card, Dropdown, Alert } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

// common libs
import { Header, Account, Body } from "./components";
import { useExchangePrice,  useUserProvider} from "./hooks";
// assets
import "antd/dist/antd.css";
import "./App.css";

//added stuff
import { ethers } from "ethers";
import { Buttons } from "./components/mainComponents/funderButtons";
import { useForm } from "react-hook-form";
// import CPK from "contract-proxy-kit"
import { useQuery } from '@apollo/react-hooks';

import { HomePage } from "./components/pages/HomePage";
import { FunderPage } from "./components/pages/FunderPage";
import { OwnerPage } from "./components/pages/OwnerPage";
import { AuditorPage } from "./components/pages/AuditorPage";
import { BidderPage } from "./components/pages/BidderPage";

import { GET_FUNDERS } from "./graphql/subgraph";

const { abi: abiToken } = require("./abis/SecurityToken.json");
const { abi: abiEscrow } = require("./abis/HolderContract.json");
const { abi: abiTokenF } = require("./abis/TokenFactory.json");
const { abi: abiEscrowF } = require("./abis/HolderFactory.json");
const { abi: abiDai } = require("./abis/Dai.json");
const { abi: abiCT } = require("./abis/ConditionalTokens.json");

/* IMPORTANT STEPS FOR TESTING 
1) Start buidler node (or ganache-cli -h 0.0.0.0, if trying to use theGraph then start a docker graph-node too and deploy from lucidity-funder-tracker)
2) Start react app
3) run buidler test on frontend test script (make sure your metamask mnemonic is saved in mnemonic.txt in buidler folder and add to gitignore)
4) change firstproject address in subgraph.yaml and redeploy graph-node (docker-compose up) and subgraph (yarn create-local and yarn deploy-local)
5) may have to change contract addresses below since we all have different metamask accounts. You will have to restart the app to relink them. 
6) may have to reset metamask account to sync nonce
7) click give self 100 dai, if this works then everything should work now. 
*/

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

  // const [route, setRoute] = useState();
  // useEffect(() => {
  //   console.log("SETTING ROUTE", window.location.pathname)
  //   setRoute(window.location.pathname)
  // }, [window.location.pathname]);
  
  //theGraph API requests
  const { loading, gqlerror, data } = useQuery(GET_FUNDERS);
  const [ funderList, setList ] = useState("No funders yet, be the first one!")
  const queryResult = () => {
    if (loading) console.log("loading")
    if (gqlerror) console.log("error")
    else {
      console.log(data)
        //https://www.apollographql.com/docs/react/get-started/
        setList(data.fundingTokens.map(({ id, owner, fundingvalue, tenor}) => (
        <div>
          <div>Token id: {id}</div>
          <div>Owner: {owner}</div> 
          <div>Funded amount: {fundingvalue.toString()} dai</div>
          <div>Funded tenor: {tenor.toString()} years</div>
        </div>
        )))
    }
  }
    
  //Various Buttons
  const [projectNotConnected, setConnection] = useState(true);
  const { register, handleSubmit } = useForm(); //for project name submission

  //initial contract links
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
  const [error, setError] = useState()
  const [firstEscrow, setEscrow] = useState(null);
  const [firstProjectContract, setProject] = useState(null);
  const updateContracts = async (formData) => {
    console.log("searching project name: ", formData.value)
    
    try {
      const escrow = await HolderFactory.getHolder(formData.value);
      console.log("is await failing?")
      console.log(escrow.projectAddress)
      const project = await TokenFactory.getProject(formData.value);
      console.log("it isnt failing?")
      console.log(project.projectAddress)

      setEscrow(await new ethers.Contract(
        escrow.projectAddress,
        abiEscrow,
        userProvider
      ))
  
      setProject(await new ethers.Contract(
        project.projectAddress,
        abiToken,
        userProvider
      ))

      setConnection(false) //enables buttons
      setError(
      <Alert variant="success" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Link Worked</Alert.Heading>
          <p>
          Project and escrow have been linked, feel free to continue
          </p>
      </Alert>)
    }
    catch(e) {
      console.error(e)
      setError(
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  <Alert.Heading>Link Error</Alert.Heading>
                  <p>
                  Looks like that didn't go through - make sure you spelled the name of the project correctly.
                  </p>
              </Alert>
          ) 
      }
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
      setPage(<OwnerPage 
        address={address} 
        provider ={userProvider} 
        firstEscrow = {firstEscrow}
        firstProjectContract = {firstProjectContract}
        Dai = {Dai}
        CT={CT}/>)
    }
  }

  //setting dai balance at bottom left
  const [daibalance, setDaiBalance] = useState(["  loading balance..."]);
  const updateDaiBalance = async () => {
    const daibalance = await Dai.balanceOf(address);
    console.log(daibalance.toString())
    setDaiBalance(`  Dai balance: ${daibalance.toString()}`)
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
              <Container fluid="md">
                <Row className="mt-1">
                    <Col>
                    <Card>
                      <div className="cardDiv">
                        <h6 classname="mt-1">Please {link} for new projects, otherwise search for project name below:</h6>
                          <form onSubmit={handleSubmit(updateContracts)} className="">
                            <div className="input-group mb-3">
                                <div className="input-group-append col-centered">
                                  <label>
                                  <input type="text" name="value" ref={register} className="form-control" placeholder="Honduras Agriculture Project" aria-describedby="button-addon2" />
                                  </label>
                                  <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Connect to Project</button></div>
                                </div>
                              </div>
                        </form>
                        {error}
                        </div>
                      </Card>
                      <Card className="mt-1">
                        <div className="cardDiv">
                            <Dropdown onSelect={handleSelect}>
                              <Dropdown.Toggle variant="primary" id="dropdown-basic" size="md" disabled={projectNotConnected}>
                                Roles
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item eventKey="OwnerPage">Owner</Dropdown.Item>
                                <Dropdown.Item eventKey="FunderPage">Funder</Dropdown.Item>
                                <Dropdown.Item eventKey="AuditorPage">Auditor</Dropdown.Item>
                                <Dropdown.Item eventKey="BidderPage">Bidder</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <br></br>
                            {PageState}
                        </div>
                      </Card>
                      <Card className="mt-1">
                    <div className="cardDiv"><h6>List of all funders for selected project:</h6>
                        <Button onClick = {queryResult} disabled = {projectNotConnected} size="sm">Update Funders List</Button>
                        <div>
                          {funderList}
                        </div>
                     </div>
                    </Card>
                  </Col>
                </Row>
              </Container>
                <div className="fixed-bottom">
                  <h5 style={{color: "black"}}>: Localhost faucet here</h5>
                  <Button onClick = {updateDaiBalance} size="sm">Update Dai Balance</Button>
                  {daibalance}
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
