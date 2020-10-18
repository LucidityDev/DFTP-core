import React, { Component } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";

export const FunderPage = (props) => {
    const welcome = "Funder role has been selected"

    const { register, handleSubmit } = useForm();

    const buyOne = async (formData) => {
        const owner = props.provider.getSigner();
        console.log(await owner.getAddress())
        console.log("value: ", formData.value.toString())
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
            <h5>{welcome}</h5>
                <form onSubmit={handleSubmit(buyOne)}>
                    <label>
                    Fund project for how much dai?
                    <input type="text" name="value" ref={register} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </React.Fragment>
         );
    }
