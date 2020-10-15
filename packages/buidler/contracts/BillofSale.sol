pragma solidity ^0.6.0;

contract BillOfSale {
    address payable public seller;
    address public buyer;
    string public descr;
    uint256 public price;
    bool public confirmed;

    //from OpenLaw Template
    function recordContract(
        string memory _descr,
        uint256 _price,
        address payable _seller,
        address _buyer
    ) public {
        descr = _descr;
        price = _price;
        seller = _seller;
        buyer = _buyer;
    }

    fallback() external payable {}

    function confirmReceipt() public payable {
        require(msg.sender == buyer, "only buyer can confirm");
        require(
            address(this).balance == price,
            "purchase price must be funded"
        );
        seller.transfer(address(this).balance);
        confirmed = true;
    }
}
