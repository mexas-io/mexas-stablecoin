// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { MEXAS } from "../MEXAS.sol";

/// @title MEXAS Token V2 Mock
/// @author MEXAS Stablecoin Team
/// @notice Minimal V2 implementation inheriting from V1; adds one new variable and a V2 initializer.
contract MockValidV2 is MEXAS {
  /// @notice New V2 feature flag
  uint256 public newFeature;

  /// @notice Returns the current version (overrides V1)
  /// @return The version string
  function version() public pure virtual override returns (string memory) {
    return "2.0.0";
  }

  /// @notice No-op initializer to satisfy OZ validator for new implementation
  /// @dev Proxy is already initialized in V1; this will never be called on proxy
  function initialize() external initializer {
    // No-op: proxy already initialized in V1
    // This function exists only to satisfy OpenZeppelin's upgrade validator
  }

  /// @notice V2 initializer for new storage/logic
  /// @custom:oz-upgrades-validate-as-initializer
  function initializeV2() external reinitializer(2) {
    newFeature = 42;
  }
}
