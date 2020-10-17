// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "./HolderContractERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HolderFactory {
    using Counters for Counters.Counter;
    Counters.Counter public nonce; // acts as unique identifier for minted NFTs

    HolderContract[] public holders;

    event ProjectCreated(address tokenAddress);

    mapping(string => uint256) public nameToHolderIndex;

    function deployNewHolder(
        string memory _name,
        address _CTtokenAddress,
        address _DaiAddress,
        address _owner,
        address _projectBidder,
        address _projectAuditor,
        uint256[] memory _budgets,
        uint256[] memory _timeline
    ) public returns (address) {
        //need to check if name or symbol already exists
        require(nameToHolderIndex[_name] == 0, "Name has already been taken");
        HolderContract newProject = new HolderContract(
            _name,
            _CTtokenAddress,
            _DaiAddress,
            _owner,
            _projectBidder,
            _projectAuditor,
            _budgets,
            _timeline
        );
        holders.push(newProject);

        nonce.increment(); //start at 1
        nameToHolderIndex[_name] = nonce.current();

        emit ProjectCreated(address(newProject));

        //should create safe in here too, and add an address variable for the safe.
        return address(newProject);
    }

    function getHolder(string memory _name)
        public
        view
        returns (
            address projectAddress,
            string memory name,
            address bidder
        )
    {
        HolderContract escrow = holders[nameToHolderIndex[_name] - 1];

        return (address(escrow), escrow.projectName(), escrow.bidder());
    }
}
