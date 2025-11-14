# Governance & Multi-Signature Structure

This document describes who controls the MEXAS stablecoin on each network, how many signers are required to act, and how circulating supply is managed. All information below is sourced directly from the live contracts using `npx hardhat mexas:deployment-info --network <network>` and should match canonical deployment records under `deployments/`.

## Overview

- **Issuer Safes (Owner)** hold admin privileges over the proxy (upgrade, pause, blacklist, mint/burn). Each issuer Safe is configured as a **3-of-5** multisignature wallet.
- **Treasury Safes** custody freshly minted tokens until they are distributed. Treasury Safes use a **2-of-5** multisignature policy so operational withdrawals (issuances) and redemptions can be processed without touching the issuer Safe. Minting refers strictly to invoking the contract’s `mint` function (3-of-5 issuer Safe), whereas “issuance” describes moving tokens out of the treasury Safe (2-of-5).
- The five current signer addresses are shared across all networks:
  - 0x9050401fd8e03dDB82df79Fc3A280feD7d360F71
  - 0x29d6206a6f3d4d74Edf0Ac36a9Fe0A3f8733cd25
  - 0x26bD65AE120ed6a169Bb6cc5AAd2db23fb9d7D8F
  - 0x3e7Dd8dC8C9bf7Ea1139f626a4c62A8dd97eA15c
  - 0x1324CC2bB8Ac1dD809D7d1ECF87FE3387cfD2a9d

## Circulating Supply Policy

- Tokens are considered **circulating** only when they leave the corresponding Treasury Safe.
- Minting typically targets the Treasury Safe. Those tokens remain **non-circulating** until they leave the treasury Safe.
- Redemptions return tokens to the Treasury Safe. Once received, those tokens are again treated as **non-circulating**, so no contract interaction is required during routine redemption flows.

## Privilege Matrix

| Operation | Contract Interaction | Required Safe | Threshold |
| --- | --- | --- | --- |
| Upgrade implementation | `upgradeTo` (UUPS) | Issuer Safe | 3-of-5 |
| Pause / Unpause | `pause()`, `unpause()` | Issuer Safe | 3-of-5 |
| Mint new supply | `mint(destination, amount)` | Issuer Safe | 3-of-5 |
| Redeem treasury balance | `redeem(amount)` | Issuer Safe | 3-of-5 |
| Blacklist management / destroy blocked funds | owner functions | Issuer Safe | 3-of-5 |
| Operational issuance | Treasury Safe transfer | Treasury Safe | 2-of-5 |
| Cash redemption payouts | Treasury Safe transfer | Treasury Safe | 2-of-5 |

Issuance and redemption flows therefore operate entirely out of the Treasury Safe (2-of-5), while any contract-level change continues to require issuer approval (3-of-5).

## Signer Management & Verification

- The same five signer addresses listed above are configured on every network. Any rotation must be applied to each Safe before becoming authoritative.
- After signer updates or threshold changes, run `npx hardhat mexas:deployment-info --network <network>` (or `npm run deployment-info -- --network <network>`) to confirm the Safe state on-chain.
- Deployment JSON files under `deployments/` contain transaction hashes and compiler metadata for auditors.

## Network Summary

| Network | Proxy | Issuer Safe (3-of-5) | Treasury Safe (2-of-5) |
| --- | --- | --- | --- |
| Ethereum Mainnet | 0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7 | 0x82c40c2921DC724c36FA89d0D6014C6D3DFb7c08 | 0x587b5eD0cc7a2a1BA8D39B9E3B50Fdf8665B4025 |
| Arbitrum Mainnet | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x7851bB23D54Bc032A3eb82F4cCCCAD4287Ab62a4 | 0x403F9B3F78f55a33179DEAC7F9296A0Cd9068F2d |
| Avalanche Mainnet | 0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7 | 0x524A6E0421D9bF2524d9f13595df1aefE2571A6A | 0x008646fE3F8D704C888768d9F3e10710429eE0D3 |
| Base Mainnet | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x72c41E6A7F83dB2557092814299Ea5129111Cf75 | 0xFe1113EE3d83DEE394D12B46082AEa47391DC3c1 |

> **Verification:** run `npx hardhat mexas:deployment-info --network <network>` to re-validate addresses, signer sets, and thresholds against on-chain data.
