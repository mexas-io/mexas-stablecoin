# Storage Layout Snapshots

- This directory contains storage layout snapshots for `contracts/MEXAS.sol:MEXAS`.
- Primary source of truth: the latest tagged release asset `build-artifacts.zip` uploaded by `.github/workflows/release.yml`.
- Fallback for CI diffs: `MEXAS.latest.layout.json` when no prior release is available.

## Maintenance

- On each release tag (vX.Y.Z): CI regenerates `storage-layout.json` and uploads it in `build-artifacts.zip`.
- Optionally update `MEXAS.latest.layout.json` in PRs that intentionally change storage (append-only), with reviewer sign-off.
- To refresh snapshot: `npm run storage:layout:json > docs/storage/MEXAS.latest.layout.json`
- PRs changing storage should include updated JSON snapshot if no previous release artifact exists.

## Policy

- Only append new variables at the end of `MEXAS` storage; do not reorder or change types.
- Keep inheritance order unchanged.
- Maintain `__gap` headroom.
