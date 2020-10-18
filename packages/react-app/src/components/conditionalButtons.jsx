import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export const ConditionalButtons = (props) => {
    let conditionOne;

    const setConditions = async (formData) => {
        const owner = props.provider.getSigner();
        
        //1
        conditionOne = await props.CT.connect(owner).getConditionId(
            props.firstEscrow.address,
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            2
          );
        await props.CT.connect(owner).prepareCondition(
          props.firstEscrow.address,
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          2
        );

        //2
        const ApproveMilestoneOne = await props.CT.connect(owner).getCollectionId(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          conditionOne,
          1 //0b01
        );
        const RejectMilestoneOne = await props.CT.connect(owner).getCollectionId(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          conditionOne,
          2 //0b10
        );
        
        //3
        const ApprovalOnePosition = await props.CT.connect(owner).getPositionId(
          props.Dai.address,
          ApproveMilestoneOne
        );
        const RejectOnePosition = await props.CT.connect(owner).getPositionId(
          props.Dai.address,
          RejectMilestoneOne
        );

        //4
        await props.firstEscrow
          .connect(owner)
          .callSplitPosition(
              props.Dai.address,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              conditionOne,
              [1, 2],
              ethers.BigNumber.from("10")
          );

        await props.firstEscrow.connect(owner).transferCTtoBidder(ApprovalOnePosition);
    }
    
    const reportAudit = async (formData) => {
        const owner = props.provider.getSigner();
        await props.firstEscrow
            .connect(owner)
            .callReportPayouts(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        [ethers.BigNumber.from("1"), ethers.BigNumber.from("0")]
      );
    }

    const redeemTokens = async (formData) => {
        const owner = props.provider.getSigner();
        conditionOne = await props.CT.connect(owner).getConditionId(
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
      <div>Use the following to control the escrow/conditional tokens </div>
      <button onClick = {setConditions} className="btn btn-danger btn-sm m-2">
        1) Set milestone
      </button>
      <button onClick = {reportAudit} className="btn btn-danger btn-sm m-2">
        2) Report Payout
      </button>
      <button onClick = {redeemTokens} className="btn btn-danger btn-sm m-2">
        3) Redeem Payout
      </button>
    </React.Fragment>
  );
};

