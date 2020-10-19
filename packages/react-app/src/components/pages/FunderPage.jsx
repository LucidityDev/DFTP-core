import React, { useState, Component } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Alert } from "react-bootstrap"

export const FunderPage = (props) => {
    const welcome = "Funder role has been selected"

    const { register, handleSubmit } = useForm();
    const [error, setError] = useState()

    const buyOne = async (formData) => {
        const owner = props.provider.getSigner();
        console.log(await owner.getAddress())
        console.log("value: ", formData.value.toString())
        console.log("tenor: ", formData.year.toString())
        console.log("dai: ", props.Dai.address)
        try {
        //funder approve, then call recieve from project
        await props.Dai.connect(owner).approve(
        props.firstProjectContract.address, //spender, called by owner
        ethers.BigNumber.from(formData.value.toString())
        );

        //buy and mint first funding token
        await props.firstProjectContract.connect(owner).buyOne(
        ethers.BigNumber.from(formData.value.toString()), //funded value dai
        ethers.BigNumber.from(formData.year.toString()) // tenor
        );

        //recieve the funding into the holder
        await props.firstEscrow
        .connect(owner) //anyone can call this, idk why it won't call by itself. Pay for gas fees?
        .recieveERC20(props.firstProjectContract.address, ethers.BigNumber.from("10"));
        
        setError(
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                <Alert.Heading>Transaction went through, funding token recieved!</Alert.Heading>
                <p>
                Thanks for funding this project for {formData.value.toString()} and {formData.year.toString()} years!
                </p>
            </Alert>
        ) 
    
         }
         catch(e) {
            console.log("error caught");
            setError(
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        <Alert.Heading>Transaction Error</Alert.Heading>
                        <p>
                        Looks like that didn't go through - make sure you have already selected a project and have enough funds in your wallet.
                        </p>
                    </Alert>
                ) 
            }
        }

        return ( 
            <React.Fragment>
            <h5>{welcome}</h5>
                <form onSubmit={handleSubmit(buyOne)}>
                    <label>
                    Fund project for how much dai?
                    <input type="text" name="value" ref={register} />
                    </label>
                    <label>
                    Fund project for how many years?
                    <input type="text" name="year" ref={register} />
                    </label>
                    <input type="submit" value="Submit" />
                    {error}
                </form>
            </React.Fragment>
         );
    }
