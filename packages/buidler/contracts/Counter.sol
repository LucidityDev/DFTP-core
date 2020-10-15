pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";

contract Counter {
    uint256 public count;
    address private name;

    constructor() public {
        count = 0;
        name = msg.sender;
        console.log("Current Count", count);
        console.log("Current Owner", name);
    }

    // Function to get the current count
    function get() public view returns (uint256) {
        console.log("Current Count", count);
        console.log("Current Owner", name);
        return count;
    }

    // Function to increment count by 1
    function inc() public {
        count += 1;
    }

    // Function to decrement count by 1
    function dec() public {
        count -= 1;
    }
}
