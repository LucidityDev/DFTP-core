pragma solidity 0.6.12;

import "./Token.sol";

contract Factory {
    event ProjectCreated(address tokenAddress);

    function deployNewProject(string memory _name, string memory _symbol, string memory baseURI)
    public returns (address) {
        Token t = new Token(_name, _symbol, baseURI);
        emit ProjectCreated(address(t));
    }
}
