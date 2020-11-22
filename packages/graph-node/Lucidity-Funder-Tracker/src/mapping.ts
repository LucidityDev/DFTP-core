import {DataSourceTemplate, log } from "@graphprotocol/graph-ts" 
import { newFunder } from '../generated/SecurityToken/SecurityToken' //event
import { NewProject } from '../generated/TokenFactory/TokenFactory' //event
import { FundingToken, Project } from '../generated/schema' //entities
import { SecurityToken as SecurityTokenTemplate } from '../generated/templates' //templates

export function handleNewProject(event: NewProject): void {
  let newProject = new Project(event.params.baseURI)
  log.info("New project at address: {}", [event.params.project.toHex()])
  newProject.id = event.params.project.toHex() // save project address
  newProject.name = event.params.name
  newProject.projectAddress = event.params.project.toHex()
  newProject.ownerAddress = event.params.owner.toHex()
  newProject.bidderAddress = event.params.bidder.toHex()
  newProject.auditorAddress = event.params.auditor.toHex()
  newProject.save()

  SecurityTokenTemplate.create(event.params.project) //tracks based on address
}

export function handleNewFunding(event: newFunder): void {
  //we need to connect it here
  let projectID = event.address.toHexString() //should be called from project address?
  let project = Project.load(projectID)

  let fundingToken = new FundingToken(event.params.funder.toHex())
  log.info("New funder at address: {}", [event.params.funder.toHex()])
  fundingToken.id = event.params.tokenId.toHex()
  fundingToken.project = project.id
  fundingToken.owner = event.params.funder.toHex()
  fundingToken.fundingvalue = event.params.value
  fundingToken.tenor = event.params.tenor
  fundingToken.save() //still save in case we want to query all tokens for something
}