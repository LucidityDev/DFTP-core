import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export const Buttons = (props) => {
  const sendEther = async () => {
    
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const accounts = await window.ethereum.enable();
    // console.log('accounts: ', accounts);
    // console.log('provider: ', provider);
    // const owner = provider.getSigner(); //this seems to connect to metamask

    let facuet = new ethers.Wallet("0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908c")
    facuet = await facuet.connect(props.provider);
    const tx = {
      to: props.address,
      value: ethers.utils.parseEther("1"),
    };
    await facuet.signTransaction(tx)
    await facuet.sendTransaction(tx);
  };

  const sendDai = async () => {
    const owner = props.provider.getSigner();
    await props.Dai.connect(owner).mint(owner.getAddress(),ethers.BigNumber.from("100"))
  };

  return (
    <React.Fragment>
      <div>
        <button onClick = {sendEther} variant="primary" className="btn-sm m-2">
          give self 1 ETH
        </button>
        <button onClick = {sendDai} variant="primary" className="btn-sm m-2">
          give self 100 Dai
        </button>
      </div>
    </React.Fragment>
  );
};

