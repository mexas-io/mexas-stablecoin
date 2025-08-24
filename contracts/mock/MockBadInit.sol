// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title MockBadInit
/// @author MEXAS Stablecoin Team
/// @notice This implementation is intentionally bad for testing initialization validation
/// @dev This implementation is bad because it:
/// 1. Has improper initialization pattern
/// 2. Missing initializer modifier
/// 3. Doesn't call parent initializers
contract MockBadInit is
  Initializable,
  ERC20Upgradeable,
  UUPSUpgradeable,
  OwnableUpgradeable
{
  // Bad: Public initialize function without initializer modifier
  /// @notice Bad initialize function missing initializer modifier
  function initialize() external {
    // Missing initializer modifier
    // Missing parent initializations

    // This allows multiple initializations
    _mint(msg.sender, 1000000 * 10 ** decimals());
  }

  /// @notice Authorizes upgrades (empty implementation)
  /// @param newImplementation The new implementation address
  function _authorizeUpgrade(
    address newImplementation
  ) internal override onlyOwner {
    // Empty implementation - this is intentionally bad
  }

  /// @dev Reserved storage space for future upgrades
  uint256[50] private __gap;
}
