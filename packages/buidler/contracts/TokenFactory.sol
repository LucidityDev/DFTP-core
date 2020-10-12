// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;
import "./SecurityToken.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
 * @title ERC721 Non-Fungible Token Standard Token Contract Factory
 * @notice A contract for creating clones of Token.sol used for creating (NFTs)/Projects
 * @notice Please use this contract to create your projects
 */
contract TokenFactory {
    using Counters for Counters.Counter;
    Counters.Counter public nonce; // acts as unique identifier for minted NFTs

    SecurityToken[] public projects;

    event ProjectCreated(address tokenAddress);

    mapping(string => uint256) public nameToProjectIndex;

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
        address _projectOwner,
        address _projectBidder,
        address _auditors
    ) public returns (address) {
        SecurityToken newProject = new SecurityToken(
            _name,
            _symbol,
            baseURI,
            _projectOwner,
            _projectBidder,
            _auditors
        );
        projects.push(newProject);
        nameToProjectIndex[_name] = nonce.current();
        nonce.increment();

        emit ProjectCreated(address(newProject));

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
    function getProject(uint256 _index)
        public
        view
        returns (
            address owner,
            string memory name,
            string memory symbol,
            string memory baseURI
        )
    {
        SecurityToken selectedProject = projects[_index];

        return (
            address(selectedProject),
            selectedProject.projectName(),
            selectedProject.projectSymbol(),
            selectedProject.baseURI()
        );
    }
}
