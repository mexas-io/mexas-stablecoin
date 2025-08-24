# Release Process

## Versioning

- Smart contract `version()` reflects the implementation version (e.g., `1.0.0`).
- Tag repository releases with the same semver.

## Checklist

1. Bump `version()` in implementation (if logic changes).
2. Update `CHANGELOG.md` with notable changes.
3. Ensure CI is green (lint, tests, coverage, storage layout, Slither).
4. Merge PR; create a Git tag `vX.Y.Z` on the release commit.
5. Deploy/upgrade via Safe. Update `deployments/` JSON with compiler/bytecode metadata.
6. CI automatically uploads `build-artifacts.zip` containing `storage-layout.json` for future automated diffs.

## Post‑Release

- Verify implementation on explorers (out of scope here).
- Announce release notes and any operational changes.
