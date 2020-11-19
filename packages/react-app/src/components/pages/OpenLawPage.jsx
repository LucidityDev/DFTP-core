import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { Container, Row, Dropdown } from "react-bootstrap"
import { createUserAuth, Client, ThreadID } from '@textile/hub'

import "../../App.css";
const { abi: abiOLF } = require("../../abis/ProjectTrackerFactory.json");
const { abi: abiOL } = require("../../abis/ProjectNegotiationTracker.json");
const { abi: abiToken } = require("../../abis/SecurityToken.json");

//const { abi: abiEscrow } = require("../../abis/HolderContract.json");

export const OpenLawForm = (props) => {
    const [formState, changeForm] = useState(<div>Choose your role</div>)
    const { register: register_bidder, handleSubmit: handleSubmit_bidder } = useForm(); //for bidder submission
    const { register: register_bidder_search, handleSubmit: handleSubmit_bidder_search } = useForm(); //for bidder prooject search
    const { register: register_initial, handleSubmit: handleSubmit_initial } = useForm(); //for owner submission
    const { register: register_review, handleSubmit: handleSubmit_review } = useForm(); //for project approval submission
    const user = props.provider.getSigner();

    let role = "owner"
    let project, projectContract, projectName; //assigned in pullupform

    let OpenLawFactory = new ethers.Contract(
        props.OLFaddress, //insert new project deployed address
        abiOLF,
        props.userProvider
    );

    const handleSelect = (e) => {
        role = e;
        console.log(role)
        if (e == "owner") {
            changeForm(
                <React.Fragment>
                    <form onSubmit={handleSubmit_review(pullUpForm)} className="">
                        <div><h6>Search below if you have project already submitted</h6></div>
                        <div className="input-group mb-3">
                            <div className="input-group-append col-centered">
                                <label>
                                    <input type="text" name="value" ref={register_review} className="form-control" placeholder="Honduras Agriculture Project" aria-describedby="button-addon2" />
                                </label>
                                <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Pull up bidder review</button></div>
                            </div>
                        </div>
                    </form>
                    <br></br>
                    <form onSubmit={handleSubmit_initial(sendForm)} className="">
                        <div className="input-group-append col-centered">
                            <div>
                                <label>
                                    <input type="text" name="name" ref={register_initial} className="form-control" placeholder="Honduras Agriculture Project" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="symbol" ref={register_initial} className="form-control" placeholder="HAP" aria-describedby="button-addon2" />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="text" name="milestone1" ref={register_initial} className="form-control" placeholder="Milestone One Description" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="milestone1budget" ref={register_initial} className="form-control" placeholder="Milestone One Budget" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="milestone1timeline" ref={register_initial} className="form-control" placeholder="Milestone One Timeline" aria-describedby="button-addon2" />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="text" name="milestone2" ref={register_initial} className="form-control" placeholder="Milestone Two Description" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="milestone2budget" ref={register_initial} className="form-control" placeholder="Milestone Two Budget" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="milestone2timeline" ref={register_initial} className="form-control" placeholder="Milestone Two Timeline" aria-describedby="button-addon2" />
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input type="text" name="milestone3" ref={register_initial} className="form-control" placeholder="Milestone Three Description" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="milestone3budget" ref={register_initial} className="form-control" placeholder="Milestone Three Budget" aria-describedby="button-addon2" />
                                </label>
                                <label>
                                    <input type="text" name="milestone3timeline" ref={register_initial} className="form-control" placeholder="Milestone Three Timeline" aria-describedby="button-addon2" />
                                </label>
                            </div>
                            <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Submit Project for Bidders</button></div>
                        </div>
                    </form>
                </React.Fragment>
            )
            return
        }
        if (e == "bidder") {
            changeForm(
                <React.Fragment>
                    <form onSubmit={handleSubmit_bidder_search(pullUpForm)} className="">
                        <div><h6>Search below if you have project already submitted</h6></div>
                        <div className="input-group mb-3">
                            <div className="input-group-append col-centered">
                                <label>
                                    <input type="text" name="value" ref={register_bidder_search} className="form-control" placeholder="Honduras Agriculture Project" aria-describedby="button-addon2" />
                                </label>
                                <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Pull up owner milestone template</button></div>
                            </div>
                        </div>
                    </form>
                </React.Fragment>)
            return
        }
    }

    const sendForm = async (formData) => {
        console.log(formData)
        if (role == "owner") {
            const newProject = await OpenLawFactory.connect(user).deployNewProject(
                user.getAddress(),
                props.HolderFactory.address,
                props.TokenFactory.address,
                formData.name, // form data
                formData.symbol, //form data
                formData.milestone1 + ";" + formData.milestone2 + ";" + formData.milestone3, //form data
                [ethers.BigNumber.from(formData.milestone1timeline), ethers.BigNumber.from(formData.milestone2timeline), ethers.BigNumber.from(formData.milestone3timeline)], //3 form data
                [ethers.BigNumber.from(formData.milestone1budget), ethers.BigNumber.from(formData.milestone2budget), ethers.BigNumber.from(formData.milestone3budget)]) //3 form data
        }
    }

    const sendFormBidder = async (formData) => {
        if (role == "bidder") {
            const bidderTerms = await projectContract.connect(user).newBidderTerms(
                [ethers.BigNumber.from(formData.milestone1timeline), ethers.BigNumber.from(formData.milestone2timeline), ethers.BigNumber.from(formData.milestone3timeline)], //3 form data
                [ethers.BigNumber.from(formData.milestone1budget), ethers.BigNumber.from(formData.milestone2budget), ethers.BigNumber.from(formData.milestone3budget)]) //3 form data
        }
    }

    const pullUpForm = async (formData) => {
        projectName = formData.value
        project = await OpenLawFactory.connect(user).getProject(projectName)
        projectContract = new ethers.Contract(
            project.projectAddress, //insert new project deployed address
            abiOL,
            props.userProvider
        );
        console.log(projectContract)

        if (role == "owner") {
            const all_addresses = await projectContract.connect(user).getAllBidderAddresses()
            console.log("all addresses: ", all_addresses);
            let all_address_proposals = []

            for (let i = 0; i < all_addresses.length; i++) {
                const toPush = await projectContract.connect(user).loadBidderTerms(all_addresses[i])
                all_address_proposals.push(toPush)
            }

            changeForm(
                all_address_proposals.map(({ _budgets, _timelines }, index) => {
                    return (
                        <button onClick={() => finalApproval(all_addresses[index])} id={all_addresses[index]}>
                            <div>
                                <div>Proposer: {index} {all_addresses[index]}</div>
                                <div>Project Budget: {_budgets[0].toString()} dai, {_budgets[1].toString()} dai, {_budgets[2].toString()} dai</div>
                                <div>Project Timeline: {_timelines[0].toString()} months, {_timelines[1].toString()} months, {_timelines[2].toString()} months</div>
                            </div>
                        </button>
                    )
                }))
            //changeForm() print all in buttons, where click sends off finalApproval(projectContract, bidderaddress from loop id?)
        }
        if (role == "bidder") {
            console.log("bidder pull up form called")
            const [milestones, budgets, timelines] = await projectContract.connect(user).loadOwnerTerms()
            console.log(milestones)
            changeForm(
                <form onSubmit={handleSubmit_bidder(sendFormBidder)} className="">
                    <div className="input-group-append col-centered">
                        <div>
                            <div>{milestones.split(';')[0]}</div>
                            <label>
                                <input type="text" name="milestone1budget" ref={register_bidder} className="form-control" placeholder="Milestone One Budget" aria-describedby="button-addon2" />
                            </label>
                            <label>
                                <input type="text" name="milestone1timeline" ref={register_bidder} className="form-control" placeholder="Milestone One Timeline" aria-describedby="button-addon2" />
                            </label>
                        </div>
                        <div>
                            <div>{milestones.split(';')[1]}</div>
                            <label>
                                <input type="text" name="milestone2budget" ref={register_bidder} className="form-control" placeholder="Milestone Two Budget" aria-describedby="button-addon2" />
                            </label>
                            <label>
                                <input type="text" name="milestone2timeline" ref={register_bidder} className="form-control" placeholder="Milestone Two Timeline" aria-describedby="button-addon2" />
                            </label>
                        </div>
                        <div>
                            <div>{milestones.split(';')[2]}</div>
                            <label>
                                <input type="text" name="milestone3budget" ref={register_bidder} className="form-control" placeholder="Milestone Three Budget" aria-describedby="button-addon2" />
                            </label>
                            <label>
                                <input type="text" name="milestone3timeline" ref={register_bidder} className="form-control" placeholder="Milestone Three Timeline" aria-describedby="button-addon2" />
                            </label>
                        </div>
                        <div><button className="btn col-centeredbtn btn-outline-secondary" type="submit" value="submit" id="button-addon2">Submit Project for Bidders</button></div>
                    </div>
                </form>
            )
        }
    }

    const finalApproval = async (bidderAddress) => {
        //textile stuff
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

        //getting data for textile
        const [milestones, budgets, timelines] = await projectContract.connect(user).loadOwnerTerms()
        const [timelinesB, budgetsB] = await projectContract.connect(user).loadBidderTerms(bidderAddress)
        const ownerAddress = await user.getAddress()
        const auditorAddress = await user.getAddress() //this needs to change in future
        console.log(projectContract)
        const pname = await projectContract.connect(user).projectName()

        const created = await client.create(currentThreadID, "FinishedProjects", [{
            _id: pname,
            owner: ownerAddress.toString(),
            bidder: bidderAddress.toString(),
            auditor: auditorAddress.toString(),
            milestones: milestones,
            budgets: [budgetsB[0].toString(), budgetsB[1].toString(), budgetsB[2].toString()],
            timeline: [timelinesB[0].toString(), timelinesB[1].toString(), timelinesB[2].toString()]
        }])

        console.log(created)

        const IPFShash = "hellotextile" //how to hash a query? maybe hash it inside the contract? 

        await projectContract.connect(user).approveBidderTerms(
            bidderAddress, //this should be bidder later
            props.CT.address,
            props.Dai.address,
            user.getAddress(), //this should be auditor later
            IPFShash
        )

        changeForm(
            <div>
                <button onClick={setEscrowStartFunding}>Start Funding Period</button>
            </div>
        )
    }

    const setEscrowStartFunding = async () => {
        //setting escrow
        const escrow = await props.HolderFactory.getHolder(projectName);
        const project = await props.TokenFactory.getProject(projectName);

        const firstProjectContract = new ethers.Contract(
            project.projectAddress,
            abiToken,
            props.userProvider
        );

        await firstProjectContract.connect(user).setHolder(
            escrow.projectAddress);
        changeForm(
            <div>
                All set, good luck!
                </div>
        )
    }
    return (
        <div>
            <Container>
                <Row className="d-flex justify-content-center mb-3">
                    <div className="col-lg-12 col-sm-12"><h6>For New Project Setup Only:</h6></div>
                    <div className="col-lg-12 col-sm-12 input-group d-flex justify-content-center">
                        <Dropdown onSelect={handleSelect}>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic" size="md">
                                Project Setup Roles
                                </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="owner">Owner</Dropdown.Item>
                                <Dropdown.Item eventKey="bidder">Bidder</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Row>
                <Row className="d-flex justify-content-center">
                    {formState}
                </Row>
            </Container>
        </div>
    )
}