import React, { useState, Component } from 'react';
import { ethers } from "ethers";
import CPK from "contract-proxy-kit"


export const CPKtest = (props) => {
   const [proxyKit, setProxyKit] = useState()
   useEffect = () => {
    const initializeCPK = async () => {
      setProxyKit(await CPK.create({ props.provider }))
    }

    initializeCPK()
  }, [web3])


    const txs = [
        {
        operation: CPK.CALL,
        to: DAI_ADDRESS,
        value: 0,
        data: dai.methods.approve(CDAI_ADDRESS, daiAmount).encodeABI()
        },
        {
        operation: CPK.CALL,
        to: CDAI_ADDRESS,
        value: 0,
        data: cDai.methods.mint(daiAmount).encodeABI()
        }
    ]

    await cpk.execTransactions(txs) 
}
