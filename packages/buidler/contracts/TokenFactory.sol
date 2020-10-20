// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;
import "./SecurityTokenERC20.sol";
import "./HolderContractERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
 * @title ERC721 Non-Fungible Token Standard Token Contract Factory
 * @notice A contract for creating clones of Token.sol used for creating (NFTs)/Projects
 * @notice Please use this contract to create your projects
 */
contract TokenFactory {
    using Counters for Counters.Counter;
    Counters.Counter public nonce; // acts as unique identifier for minted NFTs
    event NewProject(
        string name,
        string baseURI,
        address project,
        address owner,
        address bidder,
        address auditor
    );
    SecurityToken[] public projects;

    mapping(string => uint256) public nameToProjectIndex;
    mapping(string => uint256) public symbolToProjectIndex;

    //need a constructor here too? should only auditors be allowed to deploy projects (i.e. after approval)?

    /*
     * @notice Creates a new project token contract with token (project) name,  token symbol and project metadata
     * @dev Creates an instance of Token.sol. Emits an event with the token contact address
     *
     * @param _name string with the token name
     * @param _symbol string representing the token symbol
     * @param baseURI string containing the token IPFS hash containing project metadata
     *
     * @returns token contract address
     */
    function deployNewProject(
        string memory _name,
        string memory _symbol,
        string memory baseURI,
        address _ERC20token,
        address _projectOwner,
        address _projectBidder,
        address _auditors
    ) public returns (address) {
        //need to check if name or symbol already exists
        require(nameToProjectIndex[_name] == 0, "Name has already been taken");
        require(
            symbolToProjectIndex[_symbol] == 0,
            "Symbol has already been taken"
        );
        SecurityToken newProject = new SecurityToken(
            _name,
            _symbol,
            baseURI,
            _ERC20token,
            _projectOwner,
            _projectBidder,
            _auditors
        );
        projects.push(newProject);

        nonce.increment(); //start at 1
        symbolToProjectIndex[_symbol] = nonce.current();
        nameToProjectIndex[_name] = nonce.current();

        emit NewProject(
            _name,
            baseURI,
            address(newProject),
            _projectOwner,
            _projectBidder,
            _auditors
        );

        //should create safe in here too, and add an address variable for the safe.
        return address(newProject);
    }

    /*
     * @notice accesses array of projects in factory
     * @dev easy fetch of mapping and data
     *
     * @param _index refers to project index. Should change this to a URI mapping later.
     * @returns token contract address, name, symbol, and uri hash
     */
    function getProject(string memory _name)
        public
        view
        returns (
            address projectAddress,
            string memory name,
            string memory symbol,
            string memory baseURI
        )
    {
        SecurityToken selectedProject = projects[nameToProjectIndex[_name] - 1];

        return (
            address(selectedProject),
            selectedProject.projectName(),
            selectedProject.projectSymbol(),
            selectedProject.baseURI()
        );
    }
}
