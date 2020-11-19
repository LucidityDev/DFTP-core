import React, { Component } from 'react';
import { Button, Container, Row, Col, Card, Dropdown, Alert } from "react-bootstrap"
import { createUserAuth, Client, PrivateKey, ThreadID, UserAuth, QueryJSON} from '@textile/hub'

export const TextileTest = () => {
    let userAuth, client, thread, threads, collection, created, found, currentThreadID;
    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Project Contract',
        type: 'object',
        properties: {
          _id: { type: 'string' },
          owner: { type: 'string'},
          bidder: { type: 'string'},
          auditor: { type: 'string'},
          milestones: { type: 'string' },
          budgets: { "type": "array",
                    "items": { "type": "string" },
                    "uniqueItems": false,
                    "default": []},
          timeline: { "type": "array",
                    "items": { "type": "string" },
                    "uniqueItems": false,
                    "default": []},
        },}

    const getClient = async () => {
        const expiration = new Date(Date.now() + 60 * 1000)
        console.log(createUserAuth)
        userAuth = await createUserAuth("b4ubw5kjw4bnetzbld4zfqmbhaq", 
                                        "bnlre4or4klaezixde3izvgotxbgluxlprywsrvi", 
                                        expiration)
        console.log(userAuth)
        client = await Client.withUserAuth(userAuth)
    }

    const createThread = async () => {
        thread = await client.newDB()
    }

    const getThreads = async () => {
        threads = await client.listThreads()
        console.log(threads)
        currentThreadID = ThreadID.fromString(threads.listList[0].id)
        console.log(currentThreadID)
    }
    
    const createCollectionInThread = async () => {
        collection = await client.newCollection(currentThreadID, {name: 'FinishedProjects', schema: schema})
        console.log(collection)
    }

    const deleteCollectionInThread = async () => {
        await client.delete(currentThreadID, {name: 'FinishedProjects', schema: schema})
    }

    const deleteDB = async () => {
        await client.deleteDB(currentThreadID)
    }

    const addToCollection = async () => {
        created = await client.create(currentThreadID, "FinishedProjects", [{
            _id: "hello",
            owner: "address",
            bidder: "address",
            auditor: "address",
            milestones: "m1; m2; m3",
            budgets: [100, 200, 300],
            timeline: [5, 10, 10]
          }])

          console.log(created)
    }

    const findAll = async () => {
        found = await client.find(currentThreadID, "FinishedProjects", {}) //can put a queryJSON in the last part if we wanted to 
        console.log(found)
    }

    return (
        <div>
            <Button onClick = {getClient} size="sm">client</Button>
            <Button onClick = {createThread} size="sm">new thread</Button>
            <Button onClick = {getThreads} size="sm">check all threads</Button>
            <Button onClick = {createCollectionInThread} size="sm">create collection</Button>
            <Button onClick = {addToCollection} size="sm">add collection</Button>
            <Button onClick = {findAll} size="sm">log whole collection</Button>
            <Button onClick = {deleteDB} size="sm">delete a DB thread</Button>
        </div>
    )
}