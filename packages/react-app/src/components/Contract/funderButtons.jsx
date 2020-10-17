import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";

export const Buttons = (props) => {
  const { register, handleSubmit } = useForm();

  const [text, _changeText] = useState([
    "haven't called yet, click call button",
  ]);

  const callvalue = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const value = await provider.getBalance("0x68dfc526037e9030c8f813d014919cc89e7d4d74")
    _changeText(value.toString())
  };

  const sendEther = async (formData) => {
    
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const accounts = await window.ethereum.enable();
    // console.log('accounts: ', accounts);
    // console.log('provider: ', provider);
    // const owner = provider.getSigner(); //this seems to connect to metamask

    let facuet = new ethers.Wallet("0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122")
    facuet = await facuet.connect(props.provider);
    const tx = {
      to: props.address,
      value: ethers.utils.parseEther(formData.ticker),
    };
    await facuet.signTransaction(tx)
    await facuet.sendTransaction(tx);
  };

  return (
    <React.Fragment>
        {text}
      <form onSubmit={handleSubmit(sendEther)}>
        <label>
          Amount:
          <input type="text" name="ticker" ref={register} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <button onClick = {callvalue} className="btn btn-danger btn-sm m-2">
        Fund wallet
      </button>
    </React.Fragment>
  );
};

