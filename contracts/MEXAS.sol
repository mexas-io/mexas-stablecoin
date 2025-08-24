// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import { ERC20PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import { ERC20PermitUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title MEXAS - Mexican Peso Stablecoin
/// @notice MEXAS is a fully collateralized stablecoin pegged 1:1 to a reserve of Mexican Pesos held in bank deposits and CETES, combining blockchain efficiency with traditional financial security.
/// @dev This contract implements an upgradeable ERC20 token with compliance features such as blacklisting, pausing, and controlled issuance/redemption. MEXAS follows the UUPS upgrade pattern, ensuring flexibility for future upgrades while maintaining regulatory compliance.
contract MEXAS is
  Initializable,
  ERC20Upgradeable,
  ERC20BurnableUpgradeable,
  ERC20PausableUpgradeable,
  ERC20PermitUpgradeable,
  OwnableUpgradeable,
  UUPSUpgradeable
{
  // Custom errors
  error ZeroAddress();
  error AlreadyBlacklisted(address user);
  error NotBlacklisted(address user);
  error BlacklistedAddress(address user);
  error TransferToContractNotAllowed();

  // Events
  event BlockPlaced(address indexed _user);
  event BlockReleased(address indexed _user);
  event Mint(address indexed _destination, uint256 _amount);
  event Redeem(uint256 _amount);
  event DestroyedBlockedFunds(address indexed _blockedUser, uint256 _balance);

  // State variables
  /// @notice Tracks blacklisted addresses
  mapping(address => bool) public isBlocked;

  /// @dev Reserved storage space for future upgrades
  uint256[50] private __gap;

  // Modifiers
  /// @notice Modifier to ensure an address is not blacklisted
  /// @dev Reverts with `BlacklistedAddress` if the provided address is blacklisted
  /// @param account The address to check
  modifier onlyNotBlocked(address account) {
    if (isBlocked[account]) revert BlacklistedAddress(account);
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /// @notice Initializes the MEXA token with initial supply
  /// @param _name Token name
  /// @param _symbol Token symbol
  /// @param _initialSupply Initial token supply
  /// @param _owner Address of contract owner
  function initialize(
    string memory _name,
    string memory _symbol,
    uint256 _initialSupply,
    address _owner
  ) external initializer {
    __ERC20_init(_name, _symbol);
    __ERC20Burnable_init();
    __ERC20Pausable_init();
    __ERC20Permit_init(_name);
    __Ownable_init(_owner);
    __UUPSUpgradeable_init();

    _mint(_owner, _initialSupply);
    emit Mint(_owner, _initialSupply);
  }

  /// @notice Returns the current version of the implementation
  function version() public pure virtual returns (string memory) {
    return "1.0.0";
  }

  /// @notice Token decimals
  function decimals() public pure override returns (uint8) {
    return 6;
  }

  /// @inheritdoc ERC20Upgradeable
  function transfer(
    address to,
    uint256 value
  )
    public
    virtual
    override
    whenNotPaused
    onlyNotBlocked(_msgSender())
    returns (bool)
  {
    if (to == address(this)) revert TransferToContractNotAllowed();
    return super.transfer(to, value);
  }

  /// @inheritdoc ERC20Upgradeable
  function transferFrom(
    address from,
    address to,
    uint256 value
  )
    public
    virtual
    override
    whenNotPaused
    onlyNotBlocked(_msgSender())
    onlyNotBlocked(from)
    returns (bool)
  {
    if (to == address(this)) revert TransferToContractNotAllowed();
    return super.transferFrom(from, to, value);
  }

  /// @inheritdoc ERC20Upgradeable
  function approve(
    address spender,
    uint256 amount
  )
    public
    virtual
    override
    whenNotPaused
    onlyNotBlocked(_msgSender())
    onlyNotBlocked(spender)
    returns (bool)
  {
    return super.approve(spender, amount);
  }

  /// @inheritdoc ERC20PermitUpgradeable
  function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  )
    public
    virtual
    override
    onlyNotBlocked(owner)
    onlyNotBlocked(spender)
    whenNotPaused
  {
    super.permit(owner, spender, value, deadline, v, r, s);
  }

  /// @notice Adds address to blacklist
  /// @param _user Address to blacklist
  function addToBlockedList(address _user) external onlyOwner {
    if (isBlocked[_user]) revert AlreadyBlacklisted(_user);

    isBlocked[_user] = true;
    emit BlockPlaced(_user);
  }

  /// @notice Removes address from blacklist
  /// @param _user Address to unblacklist
  function removeFromBlockedList(address _user) external onlyOwner {
    if (!isBlocked[_user]) revert NotBlacklisted(_user);

    isBlocked[_user] = false;
    emit BlockReleased(_user);
  }

  /// @notice Mints new tokens to specified address
  /// @param _destination Recipient address
  /// @param _amount Amount to mint
  function mint(
    address _destination,
    uint256 _amount
  ) external onlyOwner onlyNotBlocked(_destination) {
    _mint(_destination, _amount);
    emit Mint(_destination, _amount);
  }

  /// @notice Burns tokens from owner's address
  /// @param _amount Amount to burn
  function redeem(uint256 _amount) external onlyOwner {
    address ownerAddr = owner();
    _burn(ownerAddr, _amount);
    emit Redeem(_amount);
  }

  /// @notice Destroys all tokens from a blacklisted address
  /// @param _blockedUser Address whose tokens will be destroyed
  function destroyBlockedFunds(address _blockedUser) external onlyOwner {
    if (!isBlocked[_blockedUser]) revert NotBlacklisted(_blockedUser);

    uint256 balance = balanceOf(_blockedUser);
    _burn(_blockedUser, balance);
    emit DestroyedBlockedFunds(_blockedUser, balance);
  }

  /// @notice Pauses token transfers
  function pause() external onlyOwner {
    _pause();
  }

  /// @notice Unpauses token transfers
  function unpause() external onlyOwner {
    _unpause();
  }

  /// @notice Changes contract owner
  /// @param newOwner Address of new owner
  function transferOwnership(
    address newOwner
  ) public virtual override onlyOwner onlyNotBlocked(newOwner) {
    if (newOwner == owner()) revert OwnableInvalidOwner(newOwner);
    super.transferOwnership(newOwner);
  }

  /// @inheritdoc ERC20Upgradeable
  function _update(
    address from,
    address to,
    uint256 value
  )
    internal
    virtual
    override(ERC20Upgradeable, ERC20PausableUpgradeable)
    whenNotPaused
  {
    super._update(from, to, value);
  }

  /// @notice Authorizes an upgrade to a new implementation
  /// @param newImplementation Address of new implementation
  function _authorizeUpgrade(
    address newImplementation
  ) internal view override onlyOwner {
    if (newImplementation == address(0)) revert ZeroAddress();
  }
}
