// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockNoUUPS
/// @author MEXAS Stablecoin Team
/// @notice This implementation is intentionally bad for testing upgrade validation
/// @dev This implementation is bad because it:
/// 1. Is not upgradeable (uses non-upgradeable ERC20)
/// 2. Has a constructor instead of initializer
/// 3. Doesn't implement UUPS pattern
contract MockNoUUPS is ERC20 {
  /// @notice Constructor that sets initial supply
  /// @dev This makes the contract non-upgradeable
  constructor() ERC20("BadToken", "BAD") {
    _mint(msg.sender, 1000000 * 10 ** decimals());
  }

  // Missing UUPSUpgradeable functionality
  // Missing initializer
  // Has immutable state set in constructor
}
