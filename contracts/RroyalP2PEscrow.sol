// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title RroyalP2PEscrow
/// @notice P2P USDT escrow with tiered per-trade limits, optional two-step (Pending→Locked) flow,
///         15-minute public cancel after lock, and admin-only dispute resolution (no on-chain KYC).
contract RroyalP2PEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum FiatCurrency {
        USD,
        GEL
    }

    enum TradeStatus {
        None,
        Pending,
        Locked,
        Completed,
        Disputed,
        Cancelled
    }

    struct Trade {
        address seller;
        address buyer;
        uint256 usdtAmount;
        uint256 fiatAmount;
        FiatCurrency fiatCurrency;
        TradeStatus status;
        /// @notice Set when status becomes Locked; used for the 15-minute release window logic.
        uint64 lockedAt;
    }

    IERC20 public immutable usdt;

    /// @notice User tier (1–3). Unset addresses are treated as tier 1.
    mapping(address => uint8) private _tier;

    uint256 public nextOrderId;
    mapping(uint256 orderId => Trade) public trades;

    /// @dev Tier 1 max trade size (USDT, 6 decimals).
    uint256 public constant TIER1_MAX_USDT = 500 * 10 ** 6;
    /// @dev Tier 2 max trade size (USDT, 6 decimals).
    uint256 public constant TIER2_MAX_USDT = 5_000 * 10 ** 6;
    /// @dev Tier 3 max trade size (USDT, 6 decimals).
    uint256 public constant TIER3_MAX_USDT = 100_000 * 10 ** 6;

    /// @dev After lock, if not completed or disputed, anyone may cancel after this duration.
    uint256 public constant RELEASE_TIMEOUT = 15 minutes;

    event TradeCreated(
        uint256 indexed orderId,
        address indexed seller,
        address indexed buyer,
        uint256 usdtAmount,
        uint256 fiatAmount,
        FiatCurrency fiatCurrency
    );
    event TradeLocked(uint256 indexed orderId, address indexed seller, uint256 usdtAmount, uint64 lockedAt);
    event USDTReleased(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event TradeCancelled(uint256 indexed orderId, address indexed seller, uint256 amount);
    event DisputeOpened(uint256 indexed orderId, address indexed by);
    event DisputeResolved(uint256 indexed orderId, address indexed recipient, uint256 amount);
    event UserTierUpdated(address indexed user, uint8 tier);

    error ZeroAddress();
    error ZeroAmount();
    error InvalidState();
    error NotSeller();
    error NotAuthorized();
    error TierLimitExceeded();
    error InvalidTier();
    error TimeoutNotReached();

    constructor(IERC20 usdtToken, address initialOwner) Ownable(initialOwner) {
        if (address(usdtToken) == address(0) || initialOwner == address(0)) {
            revert ZeroAddress();
        }
        usdt = usdtToken;
    }

    function tierOf(address user) public view returns (uint8) {
        uint8 t = _tier[user];
        return t == 0 ? 1 : t;
    }

    function maxUsdtForTier(uint8 tier) public pure returns (uint256) {
        if (tier == 1) return TIER1_MAX_USDT;
        if (tier == 2) return TIER2_MAX_USDT;
        if (tier == 3) return TIER3_MAX_USDT;
        revert InvalidTier();
    }

    /// @notice Admin upgrades a user's trading tier (off-chain review / volume milestones).
    function setUserTier(address user, uint8 tier) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();
        if (tier < 1 || tier > 3) revert InvalidTier();
        _tier[user] = tier;
        emit UserTierUpdated(user, tier);
    }

    /// @notice Step 1: Seller opens a trade off-chain terms (no USDT moved yet).
    function createTrade(
        address buyer,
        uint256 usdtAmount,
        uint256 fiatAmount,
        FiatCurrency fiatCurrency
    ) external nonReentrant returns (uint256 orderId) {
        if (buyer == address(0) || buyer == msg.sender) revert ZeroAddress();
        if (usdtAmount == 0) revert ZeroAmount();
        _requireTierLimit(msg.sender, usdtAmount);

        orderId = ++nextOrderId;
        Trade storage t = trades[orderId];
        t.seller = msg.sender;
        t.buyer = buyer;
        t.usdtAmount = usdtAmount;
        t.fiatAmount = fiatAmount;
        t.fiatCurrency = fiatCurrency;
        t.status = TradeStatus.Pending;
        t.lockedAt = 0;

        emit TradeCreated(orderId, msg.sender, buyer, usdtAmount, fiatAmount, fiatCurrency);
    }

    /// @notice Step 2: Seller locks USDT; trade becomes Locked and the 15-minute window starts.
    function lockUSDT(uint256 orderId) external nonReentrant {
        Trade storage t = trades[orderId];
        if (t.status != TradeStatus.Pending) revert InvalidState();
        if (msg.sender != t.seller) revert NotSeller();

        t.status = TradeStatus.Locked;
        t.lockedAt = uint64(block.timestamp);

        usdt.safeTransferFrom(msg.sender, address(this), t.usdtAmount);

        emit TradeLocked(orderId, msg.sender, t.usdtAmount, t.lockedAt);
    }

    /// @notice One-shot: create in Locked state with immediate USDT pull (gas-friendly UX).
    function createLockedTrade(
        uint256 usdtAmount,
        address buyer,
        uint256 fiatAmount,
        FiatCurrency fiatCurrency
    ) external nonReentrant returns (uint256 orderId) {
        if (buyer == address(0) || buyer == msg.sender) revert ZeroAddress();
        if (usdtAmount == 0) revert ZeroAmount();
        _requireTierLimit(msg.sender, usdtAmount);

        orderId = ++nextOrderId;
        Trade storage t = trades[orderId];
        t.seller = msg.sender;
        t.buyer = buyer;
        t.usdtAmount = usdtAmount;
        t.fiatAmount = fiatAmount;
        t.fiatCurrency = fiatCurrency;
        t.status = TradeStatus.Locked;
        t.lockedAt = uint64(block.timestamp);

        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);

        emit TradeCreated(orderId, msg.sender, buyer, usdtAmount, fiatAmount, fiatCurrency);
        emit TradeLocked(orderId, msg.sender, usdtAmount, t.lockedAt);
    }

    /// @notice Seller confirms fiat received off-chain and releases USDT to the buyer.
    function releaseUSDT(uint256 orderId) external nonReentrant {
        Trade storage t = trades[orderId];
        if (t.status != TradeStatus.Locked) revert InvalidState();
        if (msg.sender != t.seller) revert NotSeller();

        t.status = TradeStatus.Completed;
        usdt.safeTransfer(t.buyer, t.usdtAmount);

        emit USDTReleased(orderId, t.buyer, t.usdtAmount);
    }

    /// @notice After {RELEASE_TIMEOUT} from lock without completion, anyone may refund the seller.
    function cancelTrade(uint256 orderId) external nonReentrant {
        Trade storage t = trades[orderId];
        if (t.status != TradeStatus.Locked) revert InvalidState();
        if (block.timestamp < uint256(t.lockedAt) + RELEASE_TIMEOUT) revert TimeoutNotReached();

        uint256 amt = t.usdtAmount;
        address seller = t.seller;

        t.status = TradeStatus.Cancelled;
        usdt.safeTransfer(seller, amt);

        emit TradeCancelled(orderId, seller, amt);
    }

    /// @notice Buyer or seller freezes the trade for manual admin review.
    function openDispute(uint256 orderId) external nonReentrant {
        Trade storage t = trades[orderId];
        if (t.status != TradeStatus.Locked) revert InvalidState();
        if (msg.sender != t.buyer && msg.sender != t.seller) revert NotAuthorized();

        t.status = TradeStatus.Disputed;
        emit DisputeOpened(orderId, msg.sender);
    }

    /// @notice Admin-only: resolve dispute by sending escrowed USDT to buyer or seller.
    /// @param payBuyer If true, full balance to buyer; otherwise to seller.
    function resolveDispute(uint256 orderId, bool payBuyer) external onlyOwner nonReentrant {
        Trade storage t = trades[orderId];
        if (t.status != TradeStatus.Disputed) revert InvalidState();

        address recipient = payBuyer ? t.buyer : t.seller;
        uint256 amt = t.usdtAmount;

        t.status = TradeStatus.Completed;
        usdt.safeTransfer(recipient, amt);

        emit DisputeResolved(orderId, recipient, amt);
    }

    function _requireTierLimit(address seller, uint256 usdtAmount) internal view {
        uint8 tier = tierOf(seller);
        uint256 maxAmt = maxUsdtForTier(tier);
        if (usdtAmount > maxAmt) revert TierLimitExceeded();
    }
}
