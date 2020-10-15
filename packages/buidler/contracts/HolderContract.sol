// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface ConditionalToken {
    function splitPosition(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external;

    function reportPayouts(bytes32 questionId, uint256[] calldata payouts)
        external;
}

contract HolderContract is ERC1155Holder {
    using SafeMath for uint256;

    IERC1155 private CTtoken1155; //https://forum.openzeppelin.com/t/example-on-how-to-use-erc20-token-in-another-contract/1682
    ConditionalToken private CTtoken;
    IERC20 private ERC20token;
    address public CTtokenAddress;
    address public bidder;
    address public auditor; //change to array later
    string public projectName;
    uint256 public totalValue = 0;

    constructor(
        string memory _projectName,
        address _CTtokenAddress,
        address _DaiAddress,
        address _bidder,
        address _auditor
    ) public {
        projectName = _projectName;
        CTtoken1155 = IERC1155(_CTtokenAddress);
        CTtoken = ConditionalToken(_CTtokenAddress);
        ERC20token = IERC20(_DaiAddress);
        CTtokenAddress = _CTtokenAddress;
        bidder = _bidder;
        auditor = _auditor;
    }

    function recieveERC20(address _sender, uint256 _value) external {
        ERC20token.transferFrom(_sender, address(this), _value); //actual transfer
        totalValue = totalValue.add(_value);
        ERC20token.approve(CTtokenAddress, totalValue);
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //CT functions//
    function callSplitPosition(
        address tokenaddress,
        bytes32 parent,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 value
    ) external {
        CTtoken.splitPosition(
            tokenaddress,
            parent,
            conditionId,
            partition,
            value
        );
    }

    //transfer CT tokens to bidder wallet for a certain positionId.
    function transferCTtoBidder(uint256 positionId) external payable {
        require(
            msg.sender == bidder,
            "only bidder can redeem conditional tokens"
        );
        uint256 heldAmount = CTtoken1155.balanceOf(address(this), positionId);

        CTtoken1155.safeTransferFrom(
            address(this),
            msg.sender,
            positionId,
            heldAmount,
            ""
        );
    }

    //reportPayouts()
    function callReportPayouts(bytes32 questionID, uint256[] calldata outcome)
        external
    {
        require(msg.sender == auditor, "not auditor");
        CTtoken.reportPayouts(questionID, outcome);
    }
}
