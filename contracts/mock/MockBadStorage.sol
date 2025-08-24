// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title MockBadStorage
/// @author MEXAS Stablecoin Team
/// @notice This implementation is intentionally bad for testing storage validation
/// @dev This implementation is bad because it:
/// 1. Introduces storage variables in wrong slots
/// 2. Changes existing storage layout
/// 3. Doesn't maintain proper storage gaps
contract MockBadStorage is
  Initializable,
  ERC20Upgradeable,
  UUPSUpgradeable,
  OwnableUpgradeable
{
  // Bad: Adds storage variables without respecting previous layout
  /// @notice Bad constant that takes slot 0
  uint256 public constant SOME_VALUE = 123; // Takes slot 0
  /// @notice Bad mapping in wrong slot
  mapping(address => uint256) public newBalances; // New mapping in wrong slot

  /// @notice Initializes the bad storage contract
  function initialize() external initializer {
    __ERC20_init("MEXAS", "MEXA");
    __Ownable_init(msg.sender);
    __UUPSUpgradeable_init();
  }

  /// @notice Authorizes upgrades (empty implementation)
  /// @param newImplementation The new implementation address
  function _authorizeUpgrade(
    address newImplementation
  ) internal override onlyOwner {
    // Empty implementation - this is intentionally bad
  }

  // Missing storage gap
  // This makes the contract unsafe for upgrades
}
