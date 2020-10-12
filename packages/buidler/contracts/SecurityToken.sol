// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./SecurityToken.sol";

contract SecurityToken is ERC721, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using Address for address payable;

    event tokenMinted(uint256 tokenId, address tokenHolder);

    string public projectName;
    string public projectSymbol;

    mapping(address => uint256) public _balances;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); //use bytes as it is stored in a single word of EVM, string is dynamically sized (and can't be returned from a function to a contract)
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant AUDIT_ROLE = keccak256("AUDIT_ROLE");

    Counters.Counter public nonce; // acts as unique identifier for minted NFTs

    constructor(
        string memory _name,
        string memory _symbol,
        string memory baseURI,
        address projectOwner,
        address projectBidder,
        address auditors
    ) public ERC721(projectName, projectSymbol) {
        projectName = _name;
        projectSymbol = _symbol;
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

    //gets called by buyOne or through AAVE credit delegation
    function mint(
        address _projectFunder,
        uint256 _fundingValue,
        uint256 _tenor
    ) public returns (uint256) {
        require(_projectFunder == msg.sender, "make this more secure later"); //probably gets annoying to have project owner approve everything, but will check this later.

        uint256 tokenId = nonce.current();
        nonce.increment(); //Note that ID starts at 0.

        createFunding(_projectFunder, _fundingValue, _tenor); //can get funding details by calling tokenID in fundedTokens[], match to owner with tokenOfOwnerByIndex
        _safeMint(_projectFunder, tokenId);

        return tokenId;
    }

    //don't need exchange since value is constant for MVP
    function buyOne(uint256 _fundingValue, uint256 _tenor)
        external
        payable
        nonReentrant
    {
        uint256 amountPaidInWei = msg.value;
        require(amountPaidInWei > 0, "Amount paid must be greater than zero");

        // Price should be in [wei / NFT]
        // need to get the specific contract
        //_factory do we need an interface? or is that only for inherited contracts??
        uint256 currentPriceInWei = _fundingValue;
        require(
            amountPaidInWei >= currentPriceInWei,
            "Amount paid is not enough"
        );

        uint256 tokenId = mint(msg.sender, _fundingValue, _tenor);

        msg.sender.sendValue(amountPaidInWei - currentPriceInWei);

        //do we transfer to multisig here?

        //change minter later
        emit tokenMinted(tokenId, msg.sender);
    }

    //need to add extra layering to burn later with repayment options/interest
    function burn(uint256 tokenId) external {
        require(hasRole(AUDIT_ROLE, msg.sender), "Forbidden"); //only auditors can burn
        _burn(tokenId);
    }

    //purely for returning token data in a getter function
    function getTokenData(uint256 _index)
        public
        view
        returns (
            address _projectFunder,
            uint256 _fundingValue,
            uint256 _tenor
        )
    {
        FundingToken memory selectedToken = fundedTokens[_index];

        return (
            selectedToken.projectFunder, //not a public var, no getter function ()
            selectedToken.fundingValue,
            selectedToken.tenor
        );
    }
}
