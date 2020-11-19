import React, { useState } from 'react';
import { ethers } from "ethers";
import { Button, Alert } from "react-bootstrap"
import Select from 'react-select'

export const BidderPage = (props) => {
    const welcome = "Bidder role has been selected"
    const [error, setError] = useState()
    const [milestoneNotSelected, setSelected] = useState(true);
    const [currentMilestone, setMilestone] = useState("0x0000000000000000000000000000000000000000000000000000000000000001");
    const options = [
        { value: '0x0000000000000000000000000000000000000000000000000000000000000001', label: 'Milestone One' },
        { value: '0x0000000000000000000000000000000000000000000000000000000000000002', label: 'Milestone Two' },
        { value: '0x0000000000000000000000000000000000000000000000000000000000000003', label: 'Milestone Three' }
      ]
  
    const onSelected = (s) => {
    setSelected(false)
    setMilestone(s.value)
    console.log(s.value, "was selected")
    }

    const redeemTokens = async (formData) => {
        const owner = props.provider.getSigner();
        let milestone;
        if(currentMilestone=="0x0000000000000000000000000000000000000000000000000000000000000001"){
          milestone = await props.escrow.getBudgets()
          milestone = milestone[0]
        }
        if(currentMilestone=="0x0000000000000000000000000000000000000000000000000000000000000002"){
          milestone = await props.escrow.getBudgets()
          milestone = milestone[1]
        }
        if(currentMilestone=="0x0000000000000000000000000000000000000000000000000000000000000003"){
          milestone = await props.escrow.getBudgets()
          milestone = milestone[2]
        }
        try {
            const conditionId = await props.CT.connect(owner).getConditionId(
            props.escrow.address,
            currentMilestone,
            2
            );
            console.log("redeemed for: ", conditionId)
            await props.CT.connect(owner).redeemPositions(
                props.Dai.address,
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                conditionId,
                [ethers.BigNumber.from("1")]
            );

            setError(
                <Alert variant="success" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>New Funds Redeemed!</Alert.Heading>
                    <p>
                    Congrats on hitting the milestone, {milestone.toString()} dai is being sent to your wallet. (Unless you've already redeemed it!)
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
                        Looks like the milestone hasn't been met yet, check with your auditor
                        </p>
                    </Alert>
                ) 
            }     
        }
        return ( 
            <React.Fragment>
                <h6>{welcome}</h6>
                <div>Use the following to control the escrow/conditional tokens </div>
                <div><Select options={options} onChange={onSelected}/></div>
                <Button onClick = {redeemTokens} variant="primary" disabled = {milestoneNotSelected} className="btn-sm m-2">
                    Redeem Payout
                </Button>
                {error}
            </React.Fragment>
         );
    }
