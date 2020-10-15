pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeDai is ERC20 {
    constructor(string memory name, string memory symbol)
        public
        ERC20(name, symbol)
    {
        _mint(msg.sender, 100);
    }

    //it doesn't seem like ERC20 allows for functions on top of it?
}
