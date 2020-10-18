import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
// import Wallet from "./Wallet";

/*

  <Balance
    address={selectedAddress}
    provider={provider}
    dollarMultiplier={price}
  />

*/


const Balance = ({
  address,
  provider,
  pollTime,
  dollarMultiplier,
  size
}) => {
  const [dollarMode, setDollarMode] = useState(true);
  const [balance, setBalance] = useState();

  const getBalance = async () => {
    if (address && provider) {
      try {
        const newBalance = await provider.getBalance(address);
        setBalance(newBalance);
      } catch (e) {
        console.log(e);
      }
    }
  };

  usePoller(() => getBalance(),
    pollTime ? pollTime : 5000,
  );

  let floatBalance = parseFloat("0.00");
  if (balance) {
    const etherBalance = formatEther(balance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  if (dollarMultiplier && dollarMode) {
    displayBalance = "$" + (floatBalance * dollarMultiplier).toFixed(2);
  }

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: size ? size : 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {displayBalance}
    </span>
  );
}

export default Balance;
