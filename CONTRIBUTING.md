# Contributing

This repository does not accept external pull requests at the moment. You're welcome to clone, analyze, and test the code. For vulnerability disclosure, please see `SECURITY.md`.

## Development Standards

### Code Quality
- One logical change per PR; include comprehensive tests
- Follow existing code style and patterns
- Add JSDoc/NatSpec documentation for new functions
- Ensure all linters pass: `npm run lint:sol && npm run lint:ts`

### Storage Layout Safety
- Keep storage layout backward compatible (append-only)
- Include storage layout report: `npm run storage:layout > storage-layout.txt`
- Add notes explaining any storage changes in PR description
- Update storage snapshot if intentionally changing layout

### Version Management
- Update `CHANGELOG.md` for user-facing changes
- Bump `version()` in contract only for logic changes (not doc/test changes)
- Tag releases match contract `version()` string

### CI Requirements
- Ensure CI passes (includes compile, test, coverage, Slither)
- Coverage must meet threshold (90%+)
- No compiler warnings allowed
- Storage layout diff reviewed if applicable

## Development Workflow

- Build and run: see `docs/OPERATIONS.md` (canonical)
- Test suite guidance: see `test/README.md`
- Storage layout policy and workflow: see `docs/STORAGE_LAYOUT.md`
- Upgrade policy: see `docs/UPGRADE_POLICY.md`
- Release process: see `docs/RELEASE.md`

## CI expectations

Refer to `.github/workflows/ci.yml`. CI enforces:
- Solidity and TypeScript linting
- Deterministic compile with no warnings
- Tests with coverage threshold (≥90% lines and branches)
- Storage layout (text and JSON) and automated diff against the latest release
- Slither static analysis

## Operational tasks

- The canonical list of operational tasks is in the README's Operations & Tasks table. Full usage and parameters are documented in `docs/OPERATIONS.md`. Task implementations live under `tasks/mexas.ts`.

## Secrets

- Never commit secrets. Use a local `.env` based on `.env.example`.
