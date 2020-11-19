// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;
import "@openzeppelin/contracts/utils/Counters.sol";

//contract being called to deploy after agreement
interface IHolderFactory {
    function deployNewHolder(
        string calldata _name,
        address _CTtokenAddress,
        address _ERC20token,
        address _owner,
        address _projectBidder,
        address _projectAuditor,
        uint256[] calldata _budgets,
        uint256[] calldata _timelines
    ) external returns (address);
}

//contract being called to deploy after agreement
interface ITokenFactory {
    function deployNewProject(
        string calldata _name,
        string calldata _symbol,
        string calldata baseURI,
        address _ERC20token,
        address _projectOwner,
        address _projectBidder,
        address _auditors
    ) external returns (address);
}

contract ProjectTrackerFactory {
    using Counters for Counters.Counter;
    Counters.Counter public nonce; // acts as unique identifier for minted NFTs

    ProjectNegotiationTracker[] public projects;
    event NewProject(
        string name,
        address owner,
        address project,
        uint256[] timelinesOwner,
        uint256[] budgetsOwner,
        string milestones
    );
    mapping(string => uint256) public nameToProjectIndex;

    function deployNewProject(
        address _owner,
        address _HolderFactory,
        address _TokenFactory,
        string memory _name,
        string memory _symbol,
        string memory _milestones,
        uint256[] memory _timeline,
        uint256[] memory _budgets
    ) public returns (address) {
        //need to check if name or symbol already exists
        require(nameToProjectIndex[_name] == 0, "Name has already been taken");
        ProjectNegotiationTracker newProject = new ProjectNegotiationTracker(
            _owner,
            _HolderFactory,
            _TokenFactory,
            _name,
            _symbol,
            _milestones,
            _timeline,
            _budgets
        );
        projects.push(newProject);

        nonce.increment(); //start at 1
        nameToProjectIndex[_name] = nonce.current();

        //emit event
        emit NewProject(
            _name,
            _owner,
            address(newProject),
            _timeline,
            _budgets,
            _milestones
        );
        //should create safe in here too, and add an address variable for the safe.
        return address(newProject);
    }

    function getProject(string memory _name)
        public
        view
        returns (address projectAddress, string memory name)
    {

            ProjectNegotiationTracker selectedProject
         = projects[nameToProjectIndex[_name] - 1];

        return (address(selectedProject), selectedProject.projectName());
    }
}

contract ProjectNegotiationTracker {
    address public owner;
    bool public ownerApproval = false;
    string public projectName;
    string public symbol;
    string public milestones;
    string public hashURI;
    address public winningBidder;
    uint256[] public timelinesOwner;
    uint256[] public budgetsOwner;

    ITokenFactory private TF;
    IHolderFactory private HF;

    event currentTermsApproved(address approvedBidder);
    event newBidSent(address Bidder, uint256[] timelines, uint256[] budgets);

    constructor(
        address _owner,
        address _HolderFactory,
        address _TokenFactory,
        string memory _name,
        string memory _symbol,
        string memory _milestones,
        uint256[] memory _timelines,
        uint256[] memory _budgets
    ) public {
        owner = _owner;
        projectName = _name;
        symbol = _symbol;
        milestones = _milestones;
        timelinesOwner = _timelines;
        budgetsOwner = _budgets;
        TF = ITokenFactory(_TokenFactory);
        HF = IHolderFactory(_HolderFactory);
    }

    address[] public all_bidders;

    mapping(address => uint256[]) public BidderToTimeline;
    mapping(address => uint256[]) public BidderToBudgets;
    mapping(address => bool) public BidderProposalStatus;

    //called by bidder submit
    function newBidderTerms(
        uint256[] calldata _timelines,
        uint256[] calldata _budgets
    ) external {
        require(
            ownerApproval == false,
            "another proposal has already been accepted"
        );
        //require(msg.sender != owner, "owner cannot create a bid");
        BidderToTimeline[msg.sender] = _timelines;
        BidderToBudgets[msg.sender] = _budgets;
        BidderProposalStatus[msg.sender] = false;
        all_bidders.push(msg.sender);
        emit newBidSent(msg.sender, _timelines, _budgets);
    }

    //called by owner approval submit
    function approveBidderTerms(
        address _bidder,
        address _CTaddress,
        address _ERC20address,
        address auditor,
        string calldata IPFShash
    ) external {
        require(msg.sender == owner, "Only project owner can approve terms");
        ownerApproval = true;
        BidderProposalStatus[_bidder] = true;
        winningBidder = _bidder;
        hashURI = IPFShash;

        //adjust owner terms to be same as bidder terms
        budgetsOwner = BidderToBudgets[msg.sender];
        timelinesOwner = BidderToTimeline[msg.sender];

        //deploy holder
        HF.deployNewHolder(
            projectName,
            _CTaddress,
            _ERC20address,
            owner,
            _bidder,
            auditor,
            BidderToBudgets[msg.sender],
            BidderToTimeline[msg.sender]
        );

        TF.deployNewProject(
            projectName,
            symbol,
            IPFShash,
            _ERC20address,
            owner,
            _bidder,
            auditor
        );

        emit currentTermsApproved(_bidder);
    }

    //loads owner terms for bidder to see
    function loadOwnerTerms()
        external
        view
        returns (
            string memory _milestones,
            uint256[] memory _timelines,
            uint256[] memory _budgets
        )
    {
        return (milestones, budgetsOwner, timelinesOwner);
    }

    //loads all bidders
    function getAllBidderAddresses() external view returns (address[] memory) {
        return (all_bidders);
    }

    //loads bidder terms for owner to see
    function loadBidderTerms(address _bidder)
        external
        view
        returns (uint256[] memory _timelines, uint256[] memory _budgets)
    {
        require(
            msg.sender == owner,
            "Only project owner can see proposed terms"
        );
        return (BidderToTimeline[_bidder], BidderToBudgets[_bidder]);
    }
}
