
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

  /**
  * @title ERC721 Non-Fungible Token Standard token creator
  * @notice A contract that creates a Non-Fungible Token (NFT) / Project once created/deployed
  * @notice Please use Factory.sol to create your Project tokens instead of this one as this one is only run once
  * @dev Contract inherits from OpenZeppelin's ERC721 contract and creates NFTs / Projects but
  * in order to create a new token (project) use Factory.sol instead
  */

contract Token is ERC721 {

    string public name;
    string public symbol;


    /**
    * @dev Initializes the contract by setting a token `name`, a token `symbol` and contract metadata.
    *
    * @param _name string with the token name
    * @param _symbol string representing the token symbol
    * @param baseURI string containing the token IPFS hash containing token metadata
    */
    constructor(string memory _name, string memory _symbol, string memory baseURI) ERC721(name, symbol)public {
        name = _name;
        symbol = _symbol;
        _setBaseURI(baseURI);
      }

      struct TokenProperties {
        address projectFunder;
        uint fundingValue;
        uint tenor;
      }

      mapping (uint => TokenProperties) public tokenIDToProperties;

      /**
      * @notice Assigns funding properties: Project Funder, Funding Value, Tenor of funding to the tokenID
      * @dev Creates TokenProperties struct with list of token properties and assigns it to a tokenID via
      * tokenIDToProperties mapping
      * @param _projectFunder the address of the funder of this particular project
      * @param _fundingValue uint that specifies the amount of funding for the project
      * @param _tenor uint specifying the tenor of the funding
      * @param _tokenID uint with the ID of the token to be assigned the above properties
      */
      function createFunding(address _projectFunder, uint _fundingValue, uint _tenor, uint _tokenID) public {
        newTokenProperties = TokenProperties(_projectFunder, _fundingValue, _tenor);

        tokenIDToProperties[_tokenID] = newTokenProperties;
      }

}
