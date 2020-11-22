// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@nomiclabs/buidler/console.sol";

contract SecurityToken is ERC721, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using Address for address payable;

    event newFunder(address funder, uint256 value, uint256 tenor);

    IERC20 public ERC20token; //rinkeby
    string public projectName;
    string public projectSymbol;
    address public owner;
    address public bidder;
    address public holderContract;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); //use bytes as it is stored in a single word of EVM, string is dynamically sized (and can't be returned from a function to a contract)
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant AUDIT_ROLE = keccak256("AUDIT_ROLE");

    Counters.Counter public nonce; // acts as unique identifier for minted NFTs

    constructor(
        string memory _name,
        string memory _symbol,
        string memory baseURI,
        address _ERC20token,
        address _holder,
        address projectOwner,
        address projectBidder,
        address auditors
    ) public ERC721(projectName, projectSymbol) {
        projectName = _name;
        projectSymbol = _symbol;
        owner = projectOwner;
        bidder = projectBidder;
        ERC20token = IERC20(_ERC20token);
        holderContract = _holder;
        _setBaseURI(baseURI);
        _setupRole(DEFAULT_ADMIN_ROLE, projectOwner);
        _setupRole(MINTER_ROLE, projectBidder);
        _setupRole(BURNER_ROLE, projectBidder);
        _setupRole(AUDIT_ROLE, auditors);
    }

    struct FundingToken {
        address projectFunder;
        uint256 fundingValue;
        uint256 tenor;
    }

    mapping(uint256 => FundingToken) public IDtoToken;
    FundingToken[] public fundedTokens;

    /*
     * @notice Assigns funding properties: Project Funder, Funding Value, Tenor of funding to the tokenID
     * @dev Creates TokenProperties struct with list of token properties and assigns it to a tokenID via
     * tokenIDToProperties mapping
     * @param _projectFunder the address of the funder of this particular project
     * @param _fundingValue uint that specifies the amount of funding for the project
     * @param _tenor uint specifying the tenor of the funding
     * @param _tokenID uint with the ID of the token to be assigned the above properties
     */
    function createFunding(
        address _projectFunder,
        uint256 _fundingValue,
        uint256 _tenor
    ) internal {
        fundedTokens.push(FundingToken(_projectFunder, _fundingValue, _tenor));
    }

    //gets called by buyOne (I guess AAVE can just buyone too?)
    function mint(
        address _projectFunder,
        uint256 _fundingValue,
        uint256 _tenor
    ) internal {
        uint256 tokenId = nonce.current();
        nonce.increment(); //Note that ID starts at 0.

        createFunding(_projectFunder, _fundingValue, _tenor); //can get funding details by calling tokenID in fundedTokens[], match to owner with tokenOfOwnerByIndex
        _safeMint(_projectFunder, tokenId);

        IDtoToken[tokenId] = fundedTokens[tokenId];

        emit newFunder(
            fundedTokens[tokenId].projectFunder,
            fundedTokens[tokenId].fundingValue,
            fundedTokens[tokenId].tenor
        );
    }

    function recieveERC20(address _sender, uint256 _value) internal {
        ERC20token.transferFrom(_sender, address(this), _value); //actual transfer
    }

    function approveERC20toHolder(uint256 _value) internal {
        ERC20token.approve(holderContract, _value); //approve transfer
    }

    //don't need exchange? not sure what best practice is.
    function buyOne(uint256 _fundingValue, uint256 _tenor)
        external
        payable
        nonReentrant
    {
        recieveERC20(msg.sender, _fundingValue);
        approveERC20toHolder(_fundingValue);
        mint(msg.sender, _fundingValue, _tenor);
    }
}
