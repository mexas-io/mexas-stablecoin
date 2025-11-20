# MEXAS Operations Guide

This comprehensive guide covers all operational aspects of the MEXAS stablecoin system, from development setup and building to deployment, token management, and day-to-day operations.

## Development Setup

### Toolchain

- Node.js: 22.x
- NPM: with `package-lock.json`
- Hardhat: 2.26.x
- Solidity: 0.8.28 (optimizer enabled, runs=200; EVM=paris)

### Quick Start

```bash
# Development - no .env needed
git clone https://github.com/mexas-io/mexas-stablecoin.git
cd mexas-stablecoin
npm ci
npm run compile
npm test
```

**For blockchain operations**: Copy `.env.example` to `.env` and configure with your network credentials.

### Full Development Pipeline

```bash
npm ci
npm run compile
npm test
npm run coverage
npm run storage:layout > storage-layout.txt
```

### Build Steps

1. **Install dependencies**: `npm ci`
2. **Lint code**: `npm run lint:sol && npm run lint:ts`
3. **Compile contracts**: `npm run compile`
   - TypeChain types are generated automatically during compile (via `@typechain/hardhat`).
   - To regenerate types without recompiling: `npm run typechain`
4. **Run tests**: `npm test`
5. **Generate coverage**: `npm run coverage && npm run coverage:check`
6. **Storage layout**: `npm run storage:layout > storage-layout.txt`
7. **Storage layout JSON**: `npm run storage:layout:json > docs/storage/MEXAS.latest.layout.json`
8. **Static analysis**: Slither via CI (see `.github/workflows/ci.yml`)

## Blockchain Operations

### Environment Variables

#### Local Development
For local compilation, testing, and linting - no environment variables needed:
```bash
npm ci           # Install dependencies
npm run compile  # Compile contracts
npm test         # Run tests on local Hardhat network
npm run coverage # Generate test coverage
npm run lint:sol # Lint Solidity code
npm run lint:ts  # Lint TypeScript code
```

#### Network Operations
For deployment, verification, and token operations on real networks - requires `.env` configuration:
```bash
cp .env.example .env
# Edit .env with your network credentials (RPC keys, private keys, addresses)
```

### Operations & Tasks

All operational commands are available via Hardhat tasks and mapped to npm scripts for convenience:

| Task | npm Script | npx Command | Purpose |
|------|------------|-------------|---------|
| `mexas:deploy` | `npm run deploy` | `npx hardhat mexas:deploy` | Deploy MEXAS token contract |
| `mexas:verify-contract` | `npm run verify` | `npx hardhat mexas:verify-contract` | Verify contract on block explorer |
| `mexas:prepare-mint` | `npm run mint` | `npx hardhat mexas:prepare-mint` | Prepare mint tx (to treasury) |
| `mexas:prepare-burn` | `npm run burn` | `npx hardhat mexas:prepare-burn` | Prepare burn/redeem tx |
| `mexas:prepare-send` | `npm run send` | `npx hardhat mexas:prepare-send` | Prepare send tx |
| `mexas:submit-tx` | `npm run submit` | `npx hardhat mexas:submit-tx` | Submit prepared tx (dev only) |
| `mexas:deploy-dry-run` | `npm run deploy:dry-run` | `npx hardhat mexas:deploy-dry-run` | Full deployment simulation (no broadcast) |
| `mexas:deployment-info` | `npm run deployment-info` | `npx hardhat mexas:deployment-info` | Audit proxy, implementation, owner, Safe owners/threshold |

### Deployment Examples

**Method 1: npm scripts (Recommended)**
```bash
# Deploy to Arbitrum Sepolia with minimal parameters
npm run deploy -- --network arbitrumSepolia --initial-supply 1000000

# Deploy with custom token metadata
npm run deploy -- --network arbitrumSepolia \
  --initial-supply 1000000 \
  --name "MEXAS Stablecoin" \
  --symbol "MEX"

# Deploy to mainnet (ensure .env is configured)
npm run deploy -- --network arbitrumMainnet --initial-supply 1000000
```

**Method 2: Direct Hardhat tasks**
```bash
# Deploy using Hardhat directly
npx hardhat mexas:deploy --network arbitrumSepolia \
  --initial-supply 1000000 \
  --name "MEXAS Stablecoin" \
  --symbol "MEX"

# Verify deployed contract
npx hardhat mexas:verify-contract --network arbitrumSepolia --address 0x...
```

### Dry-Run Deployment (Pre-flight)

Use the dry-run task before touching mainnet to validate environment variables, RPC connectivity, signer balances, and gas assumptions without creating transactions.

```bash
# Run a pre-flight check (no on-chain effects)
npm run deploy:dry-run -- --network bscMainnet --initial-supply 1000000

# Override owner/name/symbol if needed
npx hardhat mexas:deploy-dry-run --network bscMainnet \
  --initial-supply 500000 \
  --owner 0xYourOwnerSafe \
  --name "MEXAS Stablecoin" \
  --symbol "MEX"
```

### Operational Examples

> Minting, burning, and redemptions rely on the governance model summarized in [docs/GOVERNANCE.md](./GOVERNANCE.md). Issuer multisigs (3-of-5) retain upgrade/admin powers, while treasury multisigs (2-of-5) hold newly minted supply. Tokens stay non-circulating while in the treasury Safe; once transferred out they count toward circulating supply, and returning them to the treasury (redemptions) removes them from circulation without needing issuer approval.

**Minting Tokens**
```bash
# Prepare mint transaction (always mints to treasury address)
npm run mint -- --network arbitrumMainnet --amount 50000

# Alternative: Direct Hardhat task
npx hardhat mexas:prepare-mint --network arbitrumMainnet --amount 50000
```

**Burning/Redeeming Tokens**
```bash
# Prepare burn transaction (burns from owner address)
npm run burn -- --network arbitrumMainnet --amount 25000

# Alternative: Direct Hardhat task
npx hardhat mexas:prepare-burn --network arbitrumMainnet --amount 25000
```

**Sending Tokens**
```bash
# Prepare send transaction
npm run send -- --network arbitrumMainnet \
  --to 0x1234567890123456789012345678901234567890 \
  --amount 1000

# Alternative: Direct Hardhat task
npx hardhat mexas:prepare-send --network arbitrumMainnet \
  --to 0x1234567890123456789012345678901234567890 \
  --amount 1000

**Contract Verification**
```bash
# Verify contract on block explorer
npm run verify -- --network arbitrumMainnet --address <deployed-proxy-address>

# Alternative: Direct Hardhat task
npx hardhat mexas:verify-contract --network arbitrumMainnet --address <address>

# BSC verification example
npx hardhat mexas:verify-contract --network bscMainnet --address 0x405E5F9C7D6F6E9f03a5b64e275f374507734fD6
```

### Deployment Info (On-chain)
```bash
# Retrieve on-chain deployment info (proxy, impl, owner, Safe owners/threshold)
npm run deployment-info -- --network bscMainnet

# Or via Hardhat directly
npx hardhat mexas:deployment-info --network ethereumMainnet
```

### Deployment Info (On-chain)
```bash
# Retrieve on-chain deployment info (proxy, impl, owner, Safe owners/threshold)
npm run deployment-info -- --network baseMainnet

# Or via Hardhat directly
npx hardhat mexas:deployment-info --network ethereumMainnet
```

### Complete Workflow Example

**Full deployment and operations workflow:**

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your network credentials

# 2. Deploy contract
npm run deploy -- --network arbitrumSepolia -- \
  --initial-supply 1000000 \
  --name "MEXAS Stablecoin" \
  --symbol "MEX"

# 3. Verify contract (use address from deployment output)
npm run verify -- --network arbitrumSepolia --address <deployed-proxy-address>

# 4. Prepare mint transaction (to treasury)
npm run mint -- --network arbitrumSepolia --amount 50000

# 5. Execute via Gnosis Safe (production) or submit directly (development)
# For Gnosis Safe: Import the generated JSON file from transactions/
# For development: Submit directly
npm run submit -- --network arbitrumSepolia --file transactions/<generated-file>.json
```

### Transaction Submission

**For Production (Gnosis Safe Multisig)**
1. Run any prepare command (`mint`, `burn`, `send`) to generate transaction JSON
2. Import the generated file from `transactions/` directory into Gnosis Safe
3. Execute through multisig approval process

**For Development/Testing (Single-sig)**
```bash
# Submit a prepared transaction directly (bypasses multisig)
npm run submit -- --network arbitrumSepolia --file transactions/<file>.json
```

### CLI Parameters
All operational parameters are mandatory CLI arguments. Network credentials (RPC keys, private keys, addresses) require `.env` configuration.

## Build Reproducibility

- `hardhat.config.ts` pins `solc` version, optimizer, EVM version, and includes `metadata.bytecodeHash`.
- CI caches `npm` dependencies and uploads `artifacts/`, `coverage/`, and `storage-layout.txt`.
- Build artifacts are deterministic across environments.
