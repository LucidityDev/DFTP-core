pragma solidity 0.6.12;

import "./Token.sol";

  /**
  * @title ERC721 Non-Fungible Token Standard Token Contract Factory
  * @notice A contract for creating clones of Token.sol used for creating (NFTs)/Projects
  * @notice Please use this contract to create your projects
  */
contract Factory {
    event ProjectCreated(address tokenAddress);

    /**
    * @notice Creates a new project token contract with token (project) name,  token symbol and project metadata
    * @dev Creates an instance of Token.sol. Emits an event with the token contact address
    *
    * @param _name string with the token name
    * @param _symbol string representing the token symbol
    * @param baseURI string containing the token IPFS hash containing project metadata
    *
    * @returns token contract address
    */
    function deployNewProject(string memory _name, string memory _symbol, string memory baseURI)
    public returns (address) {
        Token t = new Token(_name, _symbol, baseURI);
        emit ProjectCreated(address(t));
    }
}
