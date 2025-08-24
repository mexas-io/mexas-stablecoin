## Security Policy

### Supported Versions

All released versions of the smart contracts in this repository are in scope for security reporting.

### Reporting a Vulnerability

- Please email: contact@mexas.io with a detailed description, steps to reproduce, and affected contracts/networks.
- For general information, visit: [https://mexas.io](https://mexas.io)
- We will acknowledge receipt within 3 business days.
- We aim to provide a remediation plan within 14 days and public disclosure within 90 days, or sooner if a fix is deployed.

### Scope

- Smart contracts and deployment scripts in this repository.
- Off-chain services and external dependencies are out of scope.

### Blacklist Mechanism

MEXAS implements asymmetric blacklist enforcement:

**Behavior:**
- Blacklisted addresses cannot send or approve token transfers
- Blacklisted addresses can receive token transfers from non-blacklisted addresses
- Funds in blacklisted addresses can be destroyed via the `destroyBlockedFunds()` function
- Users should be aware that tokens sent to blacklisted addresses cannot be transferred out by the address holder

**Critical Warning**: This mechanism creates irreversible fund flows to blacklisted addresses. Exercise extreme caution when transacting, as recovery procedures are controlled exclusively by the contract owner and may not be available in all circumstances.

### Bounties

We currently do not operate a public bug bounty program. Responsible disclosures are appreciated and will be credited in release notes when applicable.

