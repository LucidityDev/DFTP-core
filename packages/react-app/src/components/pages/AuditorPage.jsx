import React, { Component, useState} from 'react';
import { ethers } from "ethers";
import { Button, Alert } from "react-bootstrap"
import Select from 'react-select'
import 'bootstrap/dist/css/bootstrap.min.css';
import CPK, { EthersAdapter } from 'contract-proxy-kit';

export const AuditorPage = (props) => {
    const welcome = "Auditor role has been selected"
    const [error, setError] = useState()
    const [dataBoard, setDataBoard] = useState()
    const [milestoneNotSelected, setSelected] = useState(true);
    const [currentMilestone, setMilestone] = useState("0x0000000000000000000000000000000000000000000000000000000000000001");
    const [proxyKit, setProxyKit] =useState(null)

    let conditionId;
    
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

    const setConditions = async (formData) => {
        const owner = props.provider.getSigner();
            
        // const ethLibAdapter = new EthersAdapter({ ethers, signer: owner });
        // const cpk = await CPK.create({ ethLibAdapter });
        // console.log(cpk.address)

        try{
        
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
        const totalValueInEscrow = await props.escrow.totalValue()
        console.log(parseInt(milestone.toString()))
        console.log(parseInt(totalValueInEscrow.toString()))

        if(parseInt(milestone.toString())>parseInt(totalValueInEscrow.toString())){
          throw("Not enough money error");
        }

        //1 (requires approval)
        conditionId = await props.CT.connect(owner).getConditionId(
            props.escrow.address,
            currentMilestone,
            2
          );
        await props.CT.connect(owner).prepareCondition(
          props.escrow.address,
          currentMilestone,
          2
        );

        //2 (this is just a view function)
        const ApproveMilestoneOne = await props.CT.connect(owner).getCollectionId(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          conditionId,
          1 //0b01
        );
        const RejectMilestoneOne = await props.CT.connect(owner).getCollectionId(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          conditionId,
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
        await props.escrow
          .connect(owner)
          .callSplitPosition(
              props.Dai.address,
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              conditionId,
              [1, 2],
              ethers.BigNumber.from(milestone.toString())
          );
        
        //5 (requires approval)
        await props.escrow.connect(owner).transferCTtoBidder(ApprovalOnePosition);

        setError(
          <Alert variant="success" onClose={() => setError(null)} dismissible>
              <Alert.Heading>Milestone set!</Alert.Heading>
              <p>
              Milestone set, locking in {milestone.toString()} dai of funding.
              </p>
          </Alert>
      ) 
        }
        catch (e) {
          console.error(e)
          setError(
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                <Alert.Heading>Milestone not set</Alert.Heading>
                <p>
                Milestone has already been set, or there isn't enough funding for this milestone yet. 
                </p>
            </Alert>
        ) 
        }
    }
    
    const reportAudit = async (formData) => {
      try {
        const owner = props.provider.getSigner();
        await props.escrow
            .connect(owner)
            .callReportPayouts(
              currentMilestone,
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
              Milestone one has already been reported on by an auditor, or has not been set. 
              </p>
          </Alert>
         ) 
        }
      }

      const showData = async () => {
        let milestone, timeline;
        if(currentMilestone=="0x0000000000000000000000000000000000000000000000000000000000000001"){
          milestone = await props.escrow.getBudgets()
          timeline = await props.escrow.getTimelines()
          milestone = milestone[0]
          timeline = timeline[0]
        }
        if(currentMilestone=="0x0000000000000000000000000000000000000000000000000000000000000002"){
          milestone = await props.escrow.getBudgets()
          timeline = await props.escrow.getTimelines()
          milestone = milestone[1]
          timeline = timeline[1]
        }
        if(currentMilestone=="0x0000000000000000000000000000000000000000000000000000000000000003"){
          milestone = await props.escrow.getBudgets()
          timeline = await props.escrow.getTimelines()
          milestone = milestone[2]
          timeline = timeline[2]
        }

        setDataBoard(
          <Alert variant="dark" onClose={() => setDataBoard(null)} dismissible>
              <Alert.Heading>Milestone Data</Alert.Heading>
              <div>
                <div>Milestone Budget: {milestone.toString()} dai </div>
                <div>Milestone Timeilne: {timeline.toString()} months</div>
              </div>
          </Alert>
        )
      }

        return ( 
            <React.Fragment>
                <h6>{welcome}</h6>
                <div>Use the following to control the escrow/conditional tokens </div>
                <div><Select options={options} onChange={onSelected}/></div>
                <Button onClick = {showData} disabled={milestoneNotSelected} variant="primary" className="btn-sm m-2">
                    Show milestone targets
                </Button>
                <Button onClick = {setConditions} disabled={milestoneNotSelected} variant="primary" className="btn-sm m-2">
                    Set Milestone
                </Button>
                <Button onClick = {reportAudit} disabled={milestoneNotSelected} variant="primary" className="btn-sm m-2">
                    Confirm milestone was met
                </Button>
                {dataBoard}
                {error}
            </React.Fragment>
         );
    }
