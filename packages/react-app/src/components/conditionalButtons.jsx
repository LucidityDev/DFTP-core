import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export const ConditionalButtons = (props) => {
    let conditionOne;

    const setConditions = async (formData) => {
        const owner = props.provider.getSigner(); //this seems to connect to metamask
       
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
          //4) collateral is set with getPositionId(collateral address (dai), collectionId). this is setting the type of collateral, not amount yet. This is also the ERC1155 unique identification for this token!
          const ApprovalOnePosition = await props.CT.connect(owner).getPositionId(
            props.Dai.address,
            ApproveMilestoneOne
          );
          const RejectOnePosition = await props.CT.connect(owner).getPositionId(
            props.Dai.address,
            RejectMilestoneOne
          );

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
        const owner = props.provider.getSigner(); //this seems to connect to metamask
        await props.firstEscrow
            .connect(owner)
            .callReportPayouts(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        [ethers.BigNumber.from("1"), ethers.BigNumber.from("0")]
      );
    }

    const redeemTokens = async (formData) => {
        const owner = props.provider.getSigner(); //this seems to connect to metamask
        await props.CT.connect(owner).redeemPositions(
            props.Dai.address,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            conditionOne,
            [ethers.BigNumber.from("1")]
          );
    }

  return (
    <React.Fragment>
      <button onClick = {setConditions} className="btn btn-danger btn-sm m-2">
        Set milestone
      </button>
      <button onClick = {reportAudit} className="btn btn-danger btn-sm m-2">
        Report Payout
      </button>
      <button onClick = {redeemTokens} className="btn btn-danger btn-sm m-2">
        Redeem Payout
      </button>
    </React.Fragment>
  );
};

