// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "./AaveNonProxy.sol";

contract AaveCollateralVaultProxy {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    mapping(address => address[]) public _ownedVaults;
    mapping(address => address) public _vaults;
    // Spending limits per user measured in dollars 1e8
    mapping(address => mapping(address => uint256)) public _limits;

    mapping(address => mapping(address => bool)) public _borrowerContains;
    mapping(address => address[]) public _borrowers;
    mapping(address => address[]) public _borrowerVaults;

    address public constant aave = address(
        0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
    );
    address public constant link = address(
        0xF79D6aFBb6dA890132F9D7c355e3015f15F3406F
    );

    event IncreaseLimit(
        address indexed vault,
        address indexed owner,
        address indexed spender,
        uint256 limit
    );
    event DecreaseLimit(
        address indexed vault,
        address indexed owner,
        address indexed spender,
        uint256 limit
    );
    event SetModel(address indexed vault, address indexed owner, uint256 model);
    event SetBorrow(
        address indexed vault,
        address indexed owner,
        address indexed reserve
    );
    event Deposit(
        address indexed vault,
        address indexed owner,
        address indexed reserve,
        uint256 amount
    );
    event Withdraw(
        address indexed vault,
        address indexed owner,
        address indexed reserve,
        uint256 amount
    );
    event Borrow(
        address indexed vault,
        address indexed owner,
        address indexed reserve,
        uint256 amount
    );
    event Repay(
        address indexed vault,
        address indexed owner,
        address indexed reserve,
        uint256 amount
    );
    event DeployVault(
        address indexed vault,
        address indexed owner,
        address indexed asset
    );

    constructor() public {}

    function limit(address vault, address spender)
        external
        view
        returns (uint256)
    {
        return _limits[vault][spender];
    }

    function borrowers(address vault) external view returns (address[] memory) {
        return _borrowers[vault];
    }

    function borrowerVaults(address spender)
        external
        view
        returns (address[] memory)
    {
        return _borrowerVaults[spender];
    }

    function increaseLimit(
        address vault,
        address spender,
        uint256 addedValue
    ) external {
        require(isVaultOwner(address(vault), msg.sender), "!owner");
        if (!_borrowerContains[vault][spender]) {
            _borrowerContains[vault][spender] = true;
            _borrowers[vault].push(spender);
            _borrowerVaults[spender].push(vault);
        }
        uint256 amount = _limits[vault][spender].add(addedValue);
        _approve(vault, spender, amount);
        emit IncreaseLimit(vault, msg.sender, spender, amount);
    }

    function decreaseLimit(
        address vault,
        address spender,
        uint256 subtractedValue
    ) external {
        require(isVaultOwner(address(vault), msg.sender), "!owner");
        uint256 amount = _limits[vault][spender].sub(subtractedValue, "<0");
        _approve(vault, spender, amount);
        emit DecreaseLimit(vault, msg.sender, spender, amount);
    }

    function setModel(AaveCollateralVault vault, uint256 model) external {
        require(isVaultOwner(address(vault), msg.sender), "!owner");
        vault.setModel(model);
        emit SetModel(address(vault), msg.sender, model);
    }

    function getBorrow(AaveCollateralVault vault)
        external
        view
        returns (address)
    {
        return vault.getBorrow();
    }

    function _approve(
        address vault,
        address spender,
        uint256 amount
    ) internal {
        require(spender != address(0), "address(0)");
        _limits[vault][spender] = amount;
    }

    function isVaultOwner(address vault, address owner)
        public
        view
        returns (bool)
    {
        return _vaults[vault] == owner;
    }

    function isVault(address vault) public view returns (bool) {
        return _vaults[vault] != address(0);
    }

    // LP deposit, anyone can deposit/topup
    function deposit(
        AaveCollateralVault vault,
        address aToken,
        uint256 amount
    ) external {
        require(isVault(address(vault)), "!vault");
        IERC20(aToken).safeTransferFrom(msg.sender, address(vault), amount);
        address underlying = AaveToken(aToken).underlyingAssetAddress();
        if (vault.isReserve(underlying) == false) {
            vault.activate(underlying);
        }
        emit Deposit(address(vault), msg.sender, aToken, amount);
    }

    // No logic, handled underneath by Aave
    function withdraw(
        AaveCollateralVault vault,
        address aToken,
        uint256 amount
    ) external {
        require(isVaultOwner(address(vault), msg.sender), "!owner");
        vault.withdraw(aToken, amount, msg.sender);
        emit Withdraw(address(vault), msg.sender, aToken, amount);
    }

    // amount needs to be normalized
    function borrow(
        AaveCollateralVault vault,
        address reserve,
        uint256 amount
    ) external {
        require(isVault(address(vault)), "!vault");
        uint256 _borrow = amount;
        if (vault.asset() == address(0)) {
            _borrow = getReservePriceUSD(reserve).mul(amount);
        }
        _approve(
            address(vault),
            msg.sender,
            _limits[address(vault)][msg.sender].sub(
                _borrow,
                "borrow amount exceeds allowance"
            )
        );
        vault.borrow(reserve, amount, msg.sender);
        emit Borrow(address(vault), msg.sender, reserve, amount);
    }

    function repay(
        AaveCollateralVault vault,
        address reserve,
        uint256 amount
    ) external {
        require(isVault(address(vault)), "!vault");
        IERC20(reserve).safeTransferFrom(msg.sender, address(vault), amount);
        vault.repay(reserve, amount);
        emit Repay(address(vault), msg.sender, reserve, amount);
    }

    function getVaults(address owner) external view returns (address[] memory) {
        return _ownedVaults[owner];
    }

    function deployVault(address _asset) external returns (address) {
        address vault = address(new AaveCollateralVault());
        AaveCollateralVault(vault).setBorrow(_asset);
        // Mark address as vault
        _vaults[vault] = msg.sender;

        // Set vault owner
        _ownedVaults[msg.sender].push(vault);
        emit DeployVault(vault, msg.sender, _asset);
        return vault;
    }

    function getVaultAccountData(address _vault)
        external
        view
        returns (
            uint256 totalLiquidityUSD,
            uint256 totalCollateralUSD,
            uint256 totalBorrowsUSD,
            uint256 totalFeesUSD,
            uint256 availableBorrowsUSD,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        (
            totalLiquidityUSD,
            totalCollateralUSD,
            totalBorrowsUSD,
            totalFeesUSD,
            availableBorrowsUSD,
            currentLiquidationThreshold,
            ltv,
            healthFactor
        ) = Aave(getAave()).getUserAccountData(_vault);
        uint256 ETH2USD = getETHPriceUSD();
        totalLiquidityUSD = totalLiquidityUSD.mul(ETH2USD);
        totalCollateralUSD = totalCollateralUSD.mul(ETH2USD);
        totalBorrowsUSD = totalBorrowsUSD.mul(ETH2USD);
        totalFeesUSD = totalFeesUSD.mul(ETH2USD);
        availableBorrowsUSD = availableBorrowsUSD.mul(ETH2USD);
    }

    function getAaveOracle() public view returns (address) {
        return LendingPoolAddressesProvider(aave).getPriceOracle();
    }

    function getReservePriceETH(address reserve) public view returns (uint256) {
        return Oracle(getAaveOracle()).getAssetPrice(reserve);
    }

    function getReservePriceUSD(address reserve) public view returns (uint256) {
        return
            getReservePriceETH(reserve).mul(Oracle(link).latestAnswer()).div(
                1e26
            );
    }

    function getETHPriceUSD() public view returns (uint256) {
        return Oracle(link).latestAnswer();
    }

    function getAave() public view returns (address) {
        return LendingPoolAddressesProvider(aave).getLendingPool();
    }
}
