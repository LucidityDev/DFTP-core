// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.7.0;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        callOptionalReturn(
            token,
            abi.encodeWithSelector(token.transfer.selector, to, value)
        );
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        callOptionalReturn(
            token,
            abi.encodeWithSelector(token.transferFrom.selector, from, to, value)
        );
    }

    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        callOptionalReturn(
            token,
            abi.encodeWithSelector(token.approve.selector, spender, value)
        );
    }

    function safeIncreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(
            value
        );
        callOptionalReturn(
            token,
            abi.encodeWithSelector(
                token.approve.selector,
                spender,
                newAllowance
            )
        );
    }

    function safeDecreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(
            value,
            "SafeERC20: decreased allowance below zero"
        );
        callOptionalReturn(
            token,
            abi.encodeWithSelector(
                token.approve.selector,
                spender,
                newAllowance
            )
        );
    }

    function callOptionalReturn(IERC20 token, bytes memory data) private {
        require(address(token).isContract(), "SafeERC20: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "SafeERC20: low-level call failed");

        if (returndata.length > 0) {
            // Return data is optional
            // solhint-disable-next-line max-line-length
            require(
                abi.decode(returndata, (bool)),
                "SafeERC20: ERC20 operation did not succeed"
            );
        }
    }
}

interface Aave {
    function borrow(
        address _reserve,
        uint256 _amount,
        uint256 _interestRateModel,
        uint16 _referralCode
    ) external;

    function setUserUseReserveAsCollateral(
        address _reserve,
        bool _useAsCollateral
    ) external;

    function repay(
        address _reserve,
        uint256 _amount,
        address payable _onBehalfOf
    ) external payable;

    function getUserAccountData(address _user)
        external
        view
        returns (
            uint256 totalLiquidityETH,
            uint256 totalCollateralETH,
            uint256 totalBorrowsETH,
            uint256 totalFeesETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}

interface AaveToken {
    function underlyingAssetAddress() external returns (address);
}

interface Oracle {
    function getAssetPrice(address reserve) external view returns (uint256);

    function latestAnswer() external view returns (uint256);
}

interface LendingPoolAddressesProvider {
    function getLendingPool() external view returns (address);

    function getLendingPoolCore() external view returns (address);

    function getPriceOracle() external view returns (address);
}

contract AaveCollateralVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public constant aave = address(
        0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
    );
    uint256 public model = 2;
    address public asset = address(0);

    address public _owner;
    address[] public _activeReserves;
    mapping(address => bool) _reserves;

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(isOwner(), "!owner");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    constructor() public {
        _owner = msg.sender;
    }

    function setModel(uint256 _model) external onlyOwner {
        model = _model;
    }

    function setBorrow(address _asset) external onlyOwner {
        asset = _asset;
    }

    function getBorrow() external view returns (address) {
        return asset;
    }

    function getReserves() external view returns (address[] memory) {
        return _activeReserves;
    }

    // LP deposit, anyone can deposit/topup
    function activate(address reserve) external onlyOwner {
        if (_reserves[reserve] == false) {
            _reserves[reserve] = true;
            _activeReserves.push(reserve);
            Aave(getAave()).setUserUseReserveAsCollateral(reserve, true);
        }
    }

    // No logic, logic handled underneath by Aave
    function withdraw(
        address reserve,
        uint256 amount,
        address to
    ) external onlyOwner {
        IERC20(reserve).safeTransfer(to, amount);
    }

    function getAave() public view returns (address) {
        return LendingPoolAddressesProvider(aave).getLendingPool();
    }

    function isReserve(address reserve) external view returns (bool) {
        return _reserves[reserve];
    }

    function getAaveCore() public view returns (address) {
        return LendingPoolAddressesProvider(aave).getLendingPoolCore();
    }

    // amount needs to be normalized
    function borrow(
        address reserve,
        uint256 amount,
        address to
    ) external nonReentrant onlyOwner {
        require(
            asset == reserve || asset == address(0),
            "reserve not available"
        );
        // LTV logic handled by underlying
        Aave(getAave()).borrow(reserve, amount, model, 7);
        IERC20(reserve).safeTransfer(to, amount);
    }

    function repay(address reserve, uint256 amount)
        external
        nonReentrant
        onlyOwner
    {
        // Required for certain stable coins (USDT for example)
        IERC20(reserve).approve(address(getAaveCore()), 0);
        IERC20(reserve).approve(address(getAaveCore()), amount);
        Aave(getAave()).repay(reserve, amount, address(uint160(address(this))));
    }
}
