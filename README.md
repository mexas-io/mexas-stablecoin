# MEXAS Stablecoin

[![CI](https://github.com/mexas-io/mexas-stablecoin/actions/workflows/ci.yml/badge.svg)](https://github.com/mexas-io/mexas-stablecoin/actions/workflows/ci.yml)

MEXAS is a fully collateralized Mexican Peso (MXN) stablecoin implementation built with modern Solidity patterns and OpenZeppelin contracts. The token is designed to be upgradeable, secure, and compatible with modern DeFi protocols for the Mexican market.

For more information, visit [mexas.io](https://mexas.io).

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Operations & Tasks](#operations--tasks)
- [Security](#security)
- [Testing](#testing)
- [Network Support](#network-support)
- [Operational Model & Circulation](#operational-model--circulation)
- [Upgrade Process](#upgrade-process)
- [Deployed Addresses](#deployed-addresses)
- [Emergency Procedures](#emergency-procedures)
- [Release Process](#release-process)
- [Roadmap](#roadmap)

## Features

### Core Token Features
- ERC20 implementation using latest OpenZeppelin contracts
- 6 decimal places (matching other major stablecoins)
- Fully upgradeable using the UUPS pattern
- ERC20Permit support for gasless approvals
- Pausable functionality for emergency situations
- Comprehensive event emission for transparency

### Security Features
- Comprehensive blacklist system with asymmetric enforcement: blocks outbound transfers while allowing inbound
- Owner-controlled supply management
- Gas-optimized transfer validations with regulatory compliance controls
- Protection against transfers to the token contract address (transfers to other contracts allowed per ERC‑20)
- Centralized security controls through owner multisig
- Emergency pause functionality
- Upgradeable architecture with controlled access

### Supply Management
- Controlled minting capability
- Burning (redeem) functionality
- Ability to destroy funds from blacklisted addresses
- Full event emission for transparency
- Treasury management system

## Architecture

### Contract Structure
- `MEXAS.sol`: Main token contract implementing ERC20 functionality
- Uses OpenZeppelin's UUPS upgrade pattern
- Implements ERC20Permit for gasless approvals
- Includes comprehensive blacklist system
- Features emergency pause functionality

### Security Model
- Multi-signature ownership through Gnosis Safe
- Role-based access control (planned for v1.1)
- Comprehensive blacklist system
- Emergency pause mechanism
- Upgradeable architecture with controlled access

## Repository Structure

- `contracts/` — Solidity sources. `MEXAS.sol` is the main token; `contracts/mock/` holds upgrade-testing mocks only.
- `scripts/` — Deployment, verify, and Gnosis Safe transaction preparation utilities.
- `test/` — Numbered test files (`01-…` to `09-…`) plus `helpers/fixtures.ts`. See `test/README.md`.
- `deployments/` — Per-network JSON records and `deployments/README.md` (address table to publish).
- `typechain-types/` — Generated TypeScript types (ignored by git).
- `artifacts/`, `cache/` — Build outputs (ignored by git).
- `.github/workflows/` — CI: lint, compile, test, coverage, storage layout, Slither; release artifacts for storage diffs.

## Prerequisites

### Required Software
- **Node.js (v22 or higher)**
  If you don't have Node.js 22 installed, use `nvm`:
  ```bash
  nvm install 22
  nvm use 22
  ```

### Required Accounts
- **Gnosis Safe multisig wallet** for token ownership
- **MetaMask or WalletConnect-compatible wallet**
- **Infura API key** for network access
- **Block explorer API keys** for contract verification

## Installation

```bash
# Clone the repository
git clone https://github.com/mexas-io/mexas-stablecoin.git
cd mexas-stablecoin

# Install dependencies
npm install
```

## Configuration

### Environment Variables

**For development** (compile, test, coverage): No `.env` file needed.

**For blockchain operations** (deploy, verify, mint, etc.): Copy `.env.example` to `.env` and configure with your network credentials.

See **[Operations Guide](docs/OPERATIONS.md)** for complete environment and CLI setup.

## Development

### Building
```bash
# Compile contracts
npm run compile
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/01-initialization.test.ts

# Run tests with coverage
npm run coverage
```

## Deployment

### Supported Networks
- Ethereum Mainnet
- Arbitrum Mainnet
- Avalanche Mainnet
- Base Mainnet
- Polygon Mainnet
- Arbitrum Sepolia (Testnet)

### Quick Deploy (CLI example)
```bash
# Deploy with CLI parameters
npm run deploy --network <network-name> -- \
  --name "MEXAS Stablecoin" \
  --symbol "MEX" \
  --initial-supply 1000000

# Verify the deployed contract
npm run verify --network <network-name> -- \
  --address <deployed-address>
```
See **[Operations Guide](docs/OPERATIONS.md)** for full deployment/verification tasks and environment configuration.

### Operations & Tasks

All commands are available via `npx hardhat <task>` and mapped to npm scripts for convenience.

| Task | npm Script | Purpose |
|------|------------|---------|
| `mexas:deploy` | `npm run deploy` | Deploy MEXAS token contract |
| `mexas:verify-contract` | `npm run verify` | Verify contract on block explorer |
| `mexas:prepare-mint` | `npm run mint` | Prepare mint tx (to treasury) |
| `mexas:prepare-burn` | `npm run burn` | Prepare burn/redeem tx |
| `mexas:prepare-send` | `npm run send` | Prepare send tx |
| `mexas:submit-tx` | `npm run submit` | Submit prepared tx (dev only) |

For parameters, examples, environment setup, and the complete operational CLI (mint, burn/redeem, send, submit via Gnosis Safe) with transaction submission details, see **[docs/OPERATIONS.md](docs/OPERATIONS.md)**.

## Security

MEXAS implements multiple layers of security controls designed for regulatory compliance and operational safety:

### Access Control
- **Owner-only operations**: All privileged functions require owner authorization
- **Multisig requirement**: Owner must be a Gnosis Safe multisig wallet
- **Planned RBAC**: Role-based access control planned for v1.1 (see [Roadmap](#roadmap))

### Compliance Features
- **Blacklist system**: Asymmetric enforcement design - blocks outbound transfers while allowing inbound (fund trapping)
- **Pause mechanism**: Emergency halt capability for all token operations
- **Fund destruction**: Ability to burn tokens from blacklisted addresses

### Upgrade Safety
- **UUPS pattern**: Secure upgrade mechanism with owner-only authorization
- **Storage preservation**: Append-only storage layout with gap slots
- **Implementation validation**: Zero address checks and upgrade authorization

### Audit & Testing
- **Comprehensive testing**: CI enforces ≥90% coverage threshold
- **Static analysis**: Slither integrated in CI
- **CI/CD pipeline**: Automated testing and quality gates

For vulnerability reporting, see [SECURITY.md](SECURITY.md).

## Testing

The MEXAS token includes a comprehensive test suite that ensures security, functionality, and upgrade safety.

### Quick Test Commands
```bash
# Run all tests
npm test

# Run specific test category
npx hardhat test test/01-initialization.test.ts

# Run with coverage
npm run coverage
```

For structure, coverage goals, gas notes, standards, and troubleshooting, see **[test/README.md](test/README.md)**.

The test suite covers:
- Core functionality (initialization, transfers, blacklist, supply, pause, permit, ownership)
- Advanced features (upgrades, gas optimization)
- Security validation and edge cases
- Performance and gas usage analysis

## Network Support

### Mainnet Networks
- Ethereum Mainnet
- Arbitrum Mainnet
- Avalanche Mainnet
- Base Mainnet
- Polygon Mainnet

### Testnet Networks
- Arbitrum Sepolia

## Operational Model & Circulation

- Issuer Wallet (Gnosis Safe multisig) owns the proxy and performs privileged actions (mint, pause, upgrade).
- Treasury Wallet (Gnosis Safe multisig) receives newly minted tokens. Balances held here are considered non-circulating and do not count toward reported circulating supply.
- Any tokens transferred out of the Treasury Wallet to any external account are considered circulating.
- Minting is infrequent. Mint to Treasury, then transfer operationally as needed.
- All privileged actions (upgrade, mint, pause/unpause, blacklist operations, destroyBlockedFunds) are executed exclusively via the Issuer Wallet.

## Upgrade Process

See [Upgrade Policy](docs/UPGRADE_POLICY.md) for complete upgrade procedures and safety requirements.

## Threat Model

- **Trust assumptions**: The `owner()` is a Gnosis Safe multisig wallet. All privileged actions (upgrade, mint, pause/unpause, blacklist management, destroyBlockedFunds) require multisig approval and are executed by the Issuer Wallet.

- **Blacklist policy**: Asymmetric enforcement - blocks outbound transfers while allowing inbound. Blacklisted addresses cannot mint, approve, or transfer out, but can receive tokens.

- **Pause semantics**: When paused, transfers/approvals/permits/mint/redeem revert. Unpause restores normal operation; system state remains unchanged.

- **Upgrade safety**: UUPS proxy pattern; upgrades are owner-gated through the Issuer Wallet. Storage layout is preserved; new storage appended with gaps. Rollback path is available by upgrading to a prior implementation if required.

## Deployed Addresses

See the canonical address table in **[deployments/README.md](deployments/README.md)** (fed by `deployments/*.json`).

## Emergency Procedures

See [Security Documentation](SECURITY.md) for complete emergency response procedures.

## Release Process

See [Release Documentation](docs/RELEASE.md) for complete release procedures and checklists.

## Build Reproducibility & Historical Deployments

- The repository is pinned to Solidity 0.8.28 with optimizer enabled (runs=200) and EVM `paris` for deterministic builds going forward.
- Historical deployments may have been compiled with equivalent Solidity but with different optimizer runs and/or metadata bytecode hash settings. This can lead to bytecode differences while preserving identical behavior and storage layout.
- For external auditors:
  - Compare ABIs, storage layout and semantics; minor metadata/optimizer differences may exist across chains or releases.
  - See `docs/OPERATIONS.md` for current build policy and `deployments/` JSON for per‑deployment metadata (present on new deployments).

## Dependency Audit Notes

- Development tooling (Hardhat and plugins) may report low/moderate `npm audit` issues that are dev-only and do not affect on-chain contract safety. These tools are not deployed and are executed locally for compile/test.
- We pin exact dependency versions and keep a lockfile for determinism. Security-critical code is in `contracts/`, which uses OpenZeppelin libraries and is covered by tests and storage/upgrade validations.

## Continuous Integration

- Comprehensive CI workflow runs on pushes/PRs: Node 22, install dependencies, lint (Solidity + TypeScript), compile, test, coverage enforcement (≥90%), storage layout validation, and Slither static analysis.
- Automated storage layout diffing against previous releases for upgrade safety validation.
- No deployment automation is included; upgrades are performed via the Issuer Wallet as documented above.

## License

- MIT. See [LICENSE](LICENSE).

## Contact

- Website: [https://mexas.io](https://mexas.io)
- Email: [contact@mexas.io](mailto:contact@mexas.io)

## Audits

- When third-party audit reports are available, they will be linked here.

## Roadmap

### v1.1 — Access Control & Governance Hardening
- Introduce Role-Based Access Control (RBAC) with specialized roles:
  - `ADMIN_ROLE` (governance/admin)
  - `BLACKLISTER_ROLE`
  - `MINTER_ROLE`
  - `PAUSER_ROLE`
- Non‑breaking migration plan:
  - Preserve storage layout; append-only if needed.
  - Keep existing owner as a Gnosis Safe multisig wallet; map wallet to `ADMIN_ROLE`.
  - No proxy changes; no ABI/event signature changes.
- Governance hardening:
  - Optional timelock/upgrade delay for implementation changes.
  - On‑chain announcement events for upgrades and role changes.
- Observability:
  - Ensure comprehensive admin/action events.
  - Add off‑chain monitors/alerts for pause, role changes, blacklists, and upgrades.

### v1.2 — Scoped DeFi Integrations
- Trusted contract allowlist (admin‑managed) for integrations where needed.
- Prefer `Permit2` or scoped allowance manager over “infinite approvals”.
- Consider optional `batchTransfer` utility only if it preserves ERC‑20 semantics.
- External review/audit recommended for any new integration surface.

### v1.3 — Bridges & Cross‑chain Support (Audit‑Gated)
- Integrate L2/L3 bridge(s) via dedicated, minimal bridge adapter contracts.
- Bridge‑specific roles separated from core token roles.
- Cross‑chain state validation and L1/L2 address mapping (where applicable).
- Strict rule: no changes to core ERC‑20 semantics; bridging logic kept out of the token.

### Non‑Goals (for v1.x)
- No event signature changes on the live token.
- No ABI breaks or storage layout rewrites on existing proxies.
- No behavioral changes to transfers/approvals that would affect integrations.
