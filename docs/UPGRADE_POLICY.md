# Upgrade Policy (UUPS)

## Roles

- `owner()` controls upgrades. Owner MUST be a Gnosis Safe multisig.
- All privileged actions (upgrade, pause/unpause, blacklist ops, mint/redeem) are executed via the Safe.

## Constraints

- Keep token `name` and `symbol` unchanged across upgrades to preserve EIP-2612 domain separation.
- Append-only storage: never reorder/remove existing storage or change inheritance order.
- Maintain a storage gap for future variables.

## Required Pre‑Flight Checks

1. `npm ci && npm run compile && npm test && npm run coverage` (≥90% thresholds enforced in CI)
2. Storage layout report reviewed: `npm run storage:layout`
3. OZ upgrade validation passes in tests (e.g., `validateUpgrade` negative/positive cases)
4. Changelog updated and version bumped via `version()` in implementation
5. Security review sign‑off

## Procedure

1. Implement new logic in a new implementation contract (e.g., `MEXASV2`), appending storage only.
2. Bump `version()` return value and add any `reinitializer(N)` if needed.
3. Open PR with test results, storage layout diff, and CI green.
4. After merge, prepare upgrade transaction via Hardhat + OZ Upgrades (
   `upgrades.upgradeProxy(proxy, NewImpl, { unsafeAllow: ["missing-initializer-call"] })`).

   **Note**: The `missing-initializer-call` flag is intentional - V2+ implementations should not re-run parent initializers (see test examples in `test/08-upgrades.test.ts`).
5. Execute via Safe, wait for confirmations.
6. Verify implementation on explorer and update `deployments/` JSON with new implementation address.

## Rollback

- If a regression is found, upgrade the proxy back to the last known good implementation.
- Ensure storage compatibility and reinitializers are idempotent.
