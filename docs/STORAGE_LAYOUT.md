# Storage Layout

This document captures storage layout policy and how to verify compatibility across upgrades.

## V1 Overview (`MEXAS.sol`)

- Inheritance: `Initializable`, `ERC20Upgradeable`, `ERC20BurnableUpgradeable`, `ERC20PausableUpgradeable`, `ERC20PermitUpgradeable`, `OwnableUpgradeable`, `UUPSUpgradeable`.
- Custom storage:
  - `mapping(address => bool) public isBlocked;`
  - `uint256[50] private __gap;` (reserved for future variables)

Note: Parent contracts introduce their own slots (balances, allowances, paused state, nonces, ownership, UUPS slots, etc.). Do NOT reorder parent inheritance.

## Policy

- Append-only: new variables are appended at the end of child contract storage.
- Preserve `__gap` headroom; if consumed, reintroduce a new, smaller gap after appended variables.
- Never change types or order of existing variables.
- Never remove or reorder parent contracts.

## Verification Steps

1. Compile with storage layout enabled (configured in `hardhat.config.ts`).
2. Generate report: `npm run storage:layout > storage-layout.txt`.
3. Generate JSON: `npm run storage:layout:json > docs/storage/MEXAS.latest.layout.json`.
4. Inspect `contracts/MEXAS.sol:MEXAS` layout across versions for differences.
5. In tests, use OZ Upgrades plugin to `validateUpgrade` for negative/positive cases.
6. CI automatically diffs storage layout against previous releases (see `.github/workflows/ci.yml`).

## V2 Planning Notes

- Add new state only after existing variables; do not alter `isBlocked`.
- If adding features requiring state, add `reinitializer(2)` for V2 and keep V1 initializer untouched.
