import React, { Component, useState} from 'react';
import { ethers } from "ethers";
import { Alert } from "react-bootstrap"

export const AuditorPage = (props) => {
    const welcome = "Auditor role has been selected"
    const [error, setError] = useState()
    let conditionOne;

    const setConditions = async (formData) => {
        const owner = props.provider.getSigner();
        
        try{
        //1 (requires approval)
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

        //2 (this is just a view function)
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
        
        //3 (also a view function)
        const ApprovalOnePosition = await props.CT.connect(owner).getPositionId(
          props.Dai.address,
          ApproveMilestoneOne
        );
        const RejectOnePosition = await props.CT.connect(owner).getPositionId(
          props.Dai.address,
          RejectMilestoneOne
        );

        //4 (requires approval)
        //get total value
        const totalValueInEscrow = await props.firstEscrow.totalValue()
        await props.firstEscrow
          .connect(owner)
          .callSplitPosition(
              props.Dai.address,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              conditionOne,
              [1, 2],
              totalValueInEscrow
          );
        
        //5 (requires approval)
        await props.firstEscrow.connect(owner).transferCTtoBidder(ApprovalOnePosition);

        setError(
          <Alert variant="success" onClose={() => setError(null)} dismissible>
              <Alert.Heading>Milestone set!</Alert.Heading>
              <p>
              Milestone one set, locking in {totalValueInEscrow.toString()} dai of funding.
              </p>
          </Alert>
      ) 
        }
        catch (e) {
          setError(
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                <Alert.Heading>Milestone not set</Alert.Heading>
                <p>
                Milestone one has already been set, or escrow/project has not been linked yet.
                </p>
            </Alert>
        ) 
        }
    }
    
    const reportAudit = async (formData) => {
      try {
        const owner = props.provider.getSigner();
        await props.firstEscrow
            .connect(owner)
            .callReportPayouts(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        [ethers.BigNumber.from("1"), ethers.BigNumber.from("0")]
        );

        setError(
          <Alert variant="success" onClose={() => setError(null)} dismissible>
              <Alert.Heading>Milestone report succeeded</Alert.Heading>
              <p>
              Milestone one has been passed, funding will now be unlocked for redemption.
              </p>
          </Alert>
        ) 
            }
      catch(e) {
        setError(
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
              <Alert.Heading>Milestone report failed</Alert.Heading>
              <p>
              Milestone one has already been reported on by an auditor.
              </p>
          </Alert>
      ) 
      }
    }

        return ( 
            <React.Fragment>
                <h5>{welcome}</h5>
                <div>Use the following to control the escrow/conditional tokens </div>
                <button onClick = {setConditions} variant="primary" className="btn-sm m-2">
                    1) Set first milestone
                </button>
                <button onClick = {reportAudit} variant="primary" className="btn-sm m-2">
                    2) Confirm first milestone was met
                </button>
                {error}
            </React.Fragment>
         );
    }
