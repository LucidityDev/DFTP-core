import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap'
import { createUserAuth, Client, PrivateKey, ThreadID, UserAuth, QueryJSON} from '@textile/hub'
const { abi: abiOL } = require("../../abis/ProjectNegotiationTracker.json");

export const OwnerPage = (props) => {
    const welcome = "Owner role has been selected "
    let projectName,budgets,timeline;
    const [textArea, setText] = useState("loading...")
    
    const getProjectDetails= async () => {
        projectName = await props.escrow.projectName()
        const budgets = await props.escrow.getBudgets()
        const timelines = await props.escrow.getTimelines()

        //IPFS call
        const expiration = new Date(Date.now() + 60 * 1000)
        console.log(createUserAuth)
        const userAuth = await createUserAuth("b4ubw5kjw4bnetzbld4zfqmbhaq", 
                                        "bnlre4or4klaezixde3izvgotxbgluxlprywsrvi", 
                                        expiration)
        console.log(userAuth)
        const client = await Client.withUserAuth(userAuth)

        const threads = await client.listThreads()
        console.log(threads)
        const currentThreadID = ThreadID.fromString(threads.listList[0].id)
        console.log(currentThreadID)
        const found = await client.find(currentThreadID, "FinishedProjects", {}) //can put a queryJSON in the last part if we wanted to 
        console.log(found)

        console.log(budgets[0].toString())
        setText(
            <div>
               <h3>Project Name: {projectName}</h3>
                <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Milestone Description</th>
                    <th>Budget (Dai)</th>
                    <th>Timeline (Months)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>{found[0].milestones.split(';')[0]}</td>
                    <td>{found[0].budgets[0]}</td>
                    <td>{found[0].timeline[0]}</td>
                    </tr>
                    <tr>
                    <td>{found[0].milestones.split(';')[1]}</td>
                    <td>{found[0].budgets[1]}</td>
                    <td>{found[0].timeline[1]}</td>
                    </tr>
                    <tr>
                    <td>{found[0].milestones.split(';')[2]}</td>
                    <td>{found[0].budgets[2]}</td>
                    <td>{found[0].timeline[2]}</td>
                    </tr>
                </tbody>
                </Table>
            </div>
        )
    }

    useEffect(() => {
        getProjectDetails();
      }, []);
    
        return ( 
            <React.Fragment>
                <h6>{welcome}</h6>
                {textArea}
            </React.Fragment>
         );
    }
