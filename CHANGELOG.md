# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.0.0] - 2024-01-15 - Initial Release (unreleased)

Initial public release of MEXAS, a fully collateralized Mexican Peso stablecoin.

### Added
- **ERC-20 Implementation**: Full compatibility with OpenZeppelin v5.4.0 upgradeable contracts
- **6 Decimal Precision**: Aligned with major stablecoins (USDC, USDT) for DeFi compatibility
- **ERC-2612 Permit Support**: Gasless approvals using cryptographic signatures
- **Upgradeable Architecture**: UUPS (Universal Upgradeable Proxy Standard) pattern with owner-only authorization
- **Version Management**: Semantic versioning with `version()` function returning "1.0.0"

- **Asymmetric Blacklist System**: Prevents blacklisted addresses from sending funds while allowing incoming transfers
- **Emergency Pause Mechanism**: Owner can halt all token operations instantly
- **Access Control**: Single owner pattern designed for Gnosis Safe multisig wallet governance
- **Transfer Protection**: Prevents accidental transfers to token contract address
- **Zero Address Validation**: Protection against invalid operations
- **Controlled Minting**: Owner-only minting with blacklist validation
- **Burn/Redeem Functionality**: Owner can burn tokens from treasury
- **Blocked Fund Destruction**: Ability to burn tokens from blacklisted addresses
- **Multi-Network Support**: Deployed on Ethereum, Arbitrum, Avalanche, Base, Polygon
- **Treasury Model**: Two-tier wallet architecture (Issuer/Treasury)
- **Transaction Preparation**: Gnosis Safe multisig compatible transaction files for secure operations
- **CLI Operations**: Complete command-line interface for deployment and operations
- **78 Comprehensive Tests**: 100% function coverage across 9 test categories
- **CI/CD Pipeline**: Automated testing, linting, coverage enforcement, and Slither analysis
- **Build Reproducibility**: Pinned Solidity 0.8.28 with deterministic builds
- **Documentation**: Comprehensive documentation across 11 markdown files
- **Threat Model**: Explicit trust assumptions and security boundaries
- **Cross-Chain Consistency**: Identical implementation across all networks

### Security
- **Blacklist enforcement**: Asymmetric enforcement for security purposes
- **Emergency procedures**: Documented incident response protocols
- **Upgrade safety**: Storage layout preservation with automated validation
- **Dependency security**: Latest OpenZeppelin contracts with security audit trail

### Deployment Information

| Network | Proxy | Implementation | Issuer Wallet | Treasury Wallet |
| --- | --- | --- | --- | --- |
| Ethereum Mainnet | [0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7](https://etherscan.io/address/0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7) | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x82c40c2921DC724c36FA89d0D6014C6D3DFb7c08 | 0x587b5eD0cc7a2a1BA8D39B9E3B50Fdf8665B4025 |
| Arbitrum Mainnet | [0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303](https://arbiscan.io/address/0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303) | 0xb2F19fCb213a9afEae5d706b7DD86C97dA3Ea165 | 0x7851bB23D54Bc032A3eb82F4cCCCAD4287Ab62a4 | 0x403F9B3F78f55a33179DEAC7F9296A0Cd9068F2d |
| Avalanche Mainnet | [0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7](https://snowtrace.io/address/0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7) | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x524A6E0421D9bF2524d9f13595df1aefE2571A6A | TBD |
| Base Mainnet | [0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303](https://basescan.org/address/0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303) | 0xb2F19fCb213a9afEae5d706b7DD86C97dA3Ea165 | 0x72c41E6A7F83dB2557092814299Ea5129111Cf75 | TBD |

See `deployments/` directory for complete deployment metadata including transaction hashes and compiler settings.

[Unreleased]: https://github.com/mexas-io/mexas-stablecoin/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mexas-io/mexas-stablecoin/releases/tag/v1.0.0
