
pragma solidity 0.6.12;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Token is ERC721 {

    string public name;
    string public symbol;

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

      function createFunding(address _projectFunder, uint _fundingValue, uint _tenor, uint _tokenID) public {
        newTokenProperties = TokenProperties(_projectFunder, _fundingValue, _tenor);

        tokenIDToProperties[_tokenID] = newTokenProperties;
      }

}
