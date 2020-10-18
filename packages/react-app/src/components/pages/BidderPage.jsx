import React, { Component } from 'react';
import { ethers } from "ethers";

export const BidderPage = (props) => {
    const welcome = "Bidder role has been selected"
    
    const redeemTokens = async (formData) => {
        const owner = props.provider.getSigner();
        const conditionOne = await props.CT.connect(owner).getConditionId(
          props.firstEscrow.address,
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          2
        );
        console.log("redeemed for: ", conditionOne)
        await props.CT.connect(owner).redeemPositions(
            props.Dai.address,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            conditionOne,
            [ethers.BigNumber.from("1")]
          );
    }
        return ( 
            <React.Fragment>
                <h5>{welcome}</h5>
                <button onClick = {redeemTokens} variant="primary" className="btn-sm m-2">
                    Redeem Payout
                </button>
            </React.Fragment>
         );
    }
