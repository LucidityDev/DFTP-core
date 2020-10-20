import React, { useState, Component } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Button, Alert } from "react-bootstrap"
import { TransactionPopUp } from "../rimble/transaction"
const awaitTransactionMined = require ('await-transaction-mined');
export const FunderPage = (props) => {
    const welcome = "Funder role has been selected"

    const { register, handleSubmit } = useForm();
    const [error, setError] = useState()
    const [buyStatus, setStatus] = useState(null)

    const buyOne = async (formData) => {
        const owner = props.provider.getSigner();
        console.log(await owner.getAddress())
        console.log("value: ", formData.value.toString())
        console.log("tenor: ", formData.year.toString())
        console.log("dai: ", props.Dai.address)
        console.log("firstProjectContract: ", props.firstProjectContract.address)
        try {
            //funder approve, then call recieve from project
            let transaction = await props.Dai.connect(owner).approve(
            props.firstProjectContract.address, //spender, called by owner
            ethers.BigNumber.from(formData.value.toString())
            );
            
            let TxReceipt = await props.provider.getTransactionReceipt(transaction.hash)
            console.log(TxReceipt)

            //buy and mint first funding token
            transaction = await props.firstProjectContract.connect(owner).buyOne(
            ethers.BigNumber.from(formData.value.toString()), //funded value dai
            ethers.BigNumber.from(formData.year.toString()) // tenor
            );

            TxReceipt = await props.provider.getTransactionReceipt(transaction.hash)
            console.log(TxReceipt)

            //recieve the funding into the holder
            await props.firstEscrow
            .connect(owner) //anyone can call this, idk why it won't call by itself. Pay for gas fees?
            .recieveERC20(props.firstProjectContract.address, ethers.BigNumber.from(formData.value.toString()));
            
            setError(
                <Alert variant="success" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>Transaction went through, funding token recieved!</Alert.Heading>
                    <p>
                    Thanks for funding this project for {formData.value.toString()} dollars and {formData.year.toString()} years!
                    </p>
                </Alert>
            )     
         }
         catch(e) {
            console.error(e)
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
            <h6>{welcome}</h6>
                <form onSubmit={handleSubmit(buyOne)}>
                    <label>
                    Fund project for how much dai?   :  
                    <input type="text" name="value" ref={register} />
                    </label>
                    <label>
                    :    Fund project for how many years?   :
                    <input type="text" name="year" ref={register} />
                    </label>
                    <input type="submit" value="Submit" />
                    {buyStatus}
                    {error}
                </form>
            </React.Fragment>
         );
    }
