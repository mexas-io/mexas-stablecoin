# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### 2025-11-14 – BSC mainnet deployment & dry-run tooling

#### Added
- **Binance Smart Chain (BSC) Support**: Wired `config.ts`, Hardhat networks, and `.env` variables so the deployment pipeline can target `bscMainnet`. README, docs, and governance tables now list BSC alongside the other mainnets.
- **Dry-Run Deployment Task**: Added `scripts/deploy-mexas-dry-run.ts`, the `mexas:deploy-dry-run` Hardhat task, and `npm run deploy:dry-run` so operators can validate RPC connectivity, signer balance, and gas assumptions without broadcasting transactions.
- **Deployment Records**: Captured the canonical BSC deployment metadata in `deployments/bscMainnet-2025-10-13-22:32:28-0xe63a.json` and exposed it through the docs (Operations/Governance) for auditors.

#### Changed
- `mexas:deploy` / `verify` plus CLI docs now explicitly cover `bscMainnet`, and the verification script prints explorer guidance for BSC.
- `docs/OPERATIONS.md` gained dry-run instructions, BSC mint/burn/send/verify examples, and an updated task table.
- `package-lock.json` was regenerated (no package.json changes) to capture the refreshed dependency graph after running `npm install` with the new tooling.

#### Deployment Information

| Network | Proxy | Implementation | Issuer Wallet | Treasury Wallet |
| --- | --- | --- | --- | --- |
| Ethereum Mainnet | [0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7](https://etherscan.io/address/0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7) | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x82c40c2921DC724c36FA89d0D6014C6D3DFb7c08 | 0x587b5eD0cc7a2a1BA8D39B9E3B50Fdf8665B4025 |
| Arbitrum Mainnet | [0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303](https://arbiscan.io/address/0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303) | 0xb2F19fCb213a9afEae5d706b7DD86C97dA3Ea165 | 0x7851bB23D54Bc032A3eb82F4cCCCAD4287Ab62a4 | 0x403F9B3F78f55a33179DEAC7F9296A0Cd9068F2d |
| Avalanche Mainnet | [0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7](https://snowtrace.io/address/0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7) | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x524A6E0421D9bF2524d9f13595df1aefE2571A6A | 0x008646fE3F8D704C888768d9F3e10710429eE0D3 |
| Base Mainnet | [0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303](https://basescan.org/address/0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303) | 0xb2F19fCb213a9afEae5d706b7DD86C97dA3Ea165 | 0x72c41E6A7F83dB2557092814299Ea5129111Cf75 | 0xFe1113EE3d83DEE394D12B46082AEa47391DC3c1 |
| BSC Mainnet | [0x405E5F9C7D6F6E9f03a5b64e275f374507734fD6](https://bscscan.com/address/0x405E5F9C7D6F6E9f03a5b64e275f374507734fD6) | 0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7 | 0x42b8A305F548FA47Dd2309BC54198fcA0C9A15eA | 0x08f0583862f367f82997fe56890FAc904b2f1d2B |

See `deployments/` directory for complete deployment metadata including transaction hashes and compiler settings.

### 2025-11-14 – Governance/docs updates

#### Added
- **docs/GOVERNANCE.md**: single source of truth for issuer/treasury Safe thresholds, shared signer set, privilege matrix, and circulating-supply policy (implemented in response to the CertiK preliminary assessment dated 2025-10-13).
- **README Governance section**: links to the governance guide and summarizes Issuer vs Treasury responsibilities plus circulating-supply treatment.
- **`mexas:deployment-info` task**: Hardhat/CLI command to pull proxy, implementation, owner, and Safe owner/threshold data directly from the chain for auditing.
- **Canonical address records**: Replaced placeholder owner/treasury addresses for Ethereum, Arbitrum, Avalanche, and Base in `.env.example` and `deployments/README.md`.

### 2025-08-23 – Initial project bootstrap

Initial public setup of the MEXAS repository, importing the existing contract, tests, docs, and mainnet deployments (Ethereum, Arbitrum, Avalanche, Base).

#### Added
- **ERC-20 Implementation**: Full compatibility with OpenZeppelin v5.4.0 upgradeable contracts
- **6 Decimal Precision**: Aligned with major stablecoins (USDC, USDT) for DeFi compatibility
- **ERC-2612 Permit Support**: Gasless approvals using cryptographic signatures
- **Upgradeable Architecture**: UUPS (Universal Upgradeable Proxy Standard) pattern with owner-only authorization
- **Version Management**: Semantic versioning with `version()` function returning "1.0.0"
- **Emergency Pause Mechanism**: Owner can halt all token operations instantly
- **Access Control**: Single owner pattern designed for Gnosis Safe multisig wallet governance
- **Transfer Protection**: Prevents accidental transfers to token contract address
- **Zero Address Validation**: Protection against invalid operations
- **Controlled Minting**: Owner-only minting with blacklist validation
- **Burn/Redeem Functionality**: Owner can burn tokens from treasury
- **Blocked Fund Destruction**: Ability to burn tokens from blacklisted addresses
- **Multi-Network Support**: Ethereum, Arbitrum, Avalanche, Base, Binance Smart Chain (BSC) and Polygon
- **Deployed Networks**: Ethereum, Arbitrum, Avalanche, Base, Binance Smart Chain (BSC)
- **Treasury Model**: Two-tier wallet architecture (Issuer/Treasury)
- **Transaction Preparation**: Gnosis Safe multisig compatible transaction files for secure operations
- **CLI Operations**: Complete command-line interface for deployment and operations
- **78 Comprehensive Tests**: 100% function coverage across 9 test categories
- **CI/CD Pipeline**: Automated testing, linting, coverage enforcement, and Slither analysis
- **Build Reproducibility**: Pinned Solidity 0.8.28 with deterministic builds
- **Documentation**: Comprehensive documentation across 11 markdown files
- **Threat Model**: Explicit trust assumptions and security boundaries
- **Cross-Chain Consistency**: Identical implementation across all networks

#### Security
- **Blacklist enforcement**: Asymmetric enforcement for security purposes
- **Emergency procedures**: Documented incident response protocols
- **Upgrade safety**: Storage layout preservation with automated validation
- **Dependency security**: Latest OpenZeppelin contracts with security audit trail
