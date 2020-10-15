// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProjectTrackerFactory {
    using Counters for Counters.Counter;
    Counters.Counter public nonce; // acts as unique identifier for minted NFTs

    ProjectNegotiationTracker[] public projects;

    event ProjectCreated(address tokenAddress);

    mapping(string => uint256) public nameToProjectIndex;

    function deployNewProject(
        address _owner,
        string memory _name,
        string memory _milestones,
        uint256[] memory _timeline,
        uint256[] memory _budgets
    ) public returns (address) {
        //need to check if name or symbol already exists
        require(nameToProjectIndex[_name] == 0, "Name has already been taken");
        ProjectNegotiationTracker newProject = new ProjectNegotiationTracker(
            _owner,
            _name,
            _milestones,
            _timeline,
            _budgets
        );
        projects.push(newProject);

        nonce.increment(); //start at 1
        nameToProjectIndex[_name] = nonce.current();

        emit ProjectCreated(address(newProject));

        //should create safe in here too, and add an address variable for the safe.
        return address(newProject);
    }

    function getProject(string memory _name)
        public
        view
        returns (address projectAddress, string memory name)
    //uint256[] memory _timeline,
    //uint256[] memory _budgets
    {

            ProjectNegotiationTracker selectedProject
         = projects[nameToProjectIndex[_name] - 1];

        return (
            address(selectedProject),
            selectedProject.projectName()
            //selectedProject.milestoneTimelineMonths(),
            //selectedProject.milestoneBudget()
        );
    }
}

contract ProjectNegotiationTracker {
    address public owner;
    bool public ownerApproval = false;
    string public projectName;
    string public milestones;
    address public winningBidder;
    uint256[] public milestoneTimelineMonths;
    uint256[] public milestoneBudget;

    event currentTermsApproved(address approvedBidder);

    constructor(
        address _owner,
        string memory _name,
        string memory _milestones,
        uint256[] memory _timeline,
        uint256[] memory _budgets
    ) public {
        owner = _owner;
        projectName = _name;
        milestones = _milestones;
        milestoneTimelineMonths = _timeline;
        milestoneBudget = _budgets;
    }

    mapping(address => uint256[]) public BidderToTimeline;
    mapping(address => uint256[]) public BidderToBudgets;
    mapping(address => bool) public BidderProposalStatus;

    function newBidderTerms(
        uint256[] calldata timeline,
        uint256[] calldata budgets
    ) external {
        require(
            ownerApproval == false,
            "another proposal has already been accepted"
        );
        require(msg.sender != owner, "owner cannot create a bid");
        BidderToTimeline[msg.sender] = timeline;
        BidderToBudgets[msg.sender] = budgets;
        BidderProposalStatus[msg.sender] = false;
    }

    function loadBidderTerms(address _bidder)
        external
        view
        returns (uint256[] memory timeline, uint256[] memory budgets)
    {
        require(
            msg.sender == owner,
            "Only project owner can see proposed terms"
        );
        return (BidderToTimeline[_bidder], BidderToBudgets[_bidder]);
    }

    function approveBidderTerms(address _bidder) external {
        require(msg.sender == owner, "Only project owner can approve terms");
        ownerApproval = true;
        BidderProposalStatus[_bidder] = true;
        winningBidder = _bidder;
        emit currentTermsApproved(_bidder);
    }
}
