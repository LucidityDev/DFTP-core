import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";

export const Buttons = (props) => {
  const { register, handleSubmit } = useForm();
  const sendEther = async () => {
    
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const accounts = await window.ethereum.enable();
    // console.log('accounts: ', accounts);
    // console.log('provider: ', provider);
    // const owner = provider.getSigner(); //this seems to connect to metamask

    let facuet = new ethers.Wallet("0x28d1bfbbafe9d1d4f5a11c3c16ab6bf9084de48d99fbac4058bdfa3c80b2908f")
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

  const buyOne = async (formData) => {
    const owner = props.provider.getSigner();

    //funder approve, then call recieve from project
    await props.Dai.connect(owner).approve(
      props.firstProjectContract.address, //spender, called by owner
      ethers.BigNumber.from(formData.value.toString())
    );

    //buy and mint first funding token
    await props.firstProjectContract.connect(owner).buyOne(
      ethers.BigNumber.from(formData.value.toString()), //funded value dai
      ethers.BigNumber.from("7") // tenor
    );

    //recieve the funding into the holder
    await props.firstEscrow
    .connect(owner) //anyone can call this, idk why it won't call by itself. Pay for gas fees?
    .recieveERC20(props.firstProjectContract.address, ethers.BigNumber.from("10"));
  }

  return (
    <React.Fragment>
      <button onClick = {props.onUpdate} className="btn btn-danger btn-sm m-2">
        Click this after deploying contracts to relink
      </button>
      <form onSubmit={handleSubmit(buyOne)}>
        <label>
          Fund project for how much dai?
          <input type="text" name="value" ref={register} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <div>
      <button onClick = {sendEther} className="btn btn-danger btn-sm m-2">
        give self 1 ETH
      </button>
      <button onClick = {sendDai} className="btn btn-danger btn-sm m-2">
        give self 100 Dai
      </button>
      <button onClick = {props.onCall} className="btn btn-danger btn-sm m-2">
        Update balance at top
      </button>
      </div>
    </React.Fragment>
  );
};

