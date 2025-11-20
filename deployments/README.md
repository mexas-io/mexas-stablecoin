# Deployments

This document lists deployed addresses per network. Replace placeholders when publishing.

| Network | Proxy | Implementation | Issuer Wallet | Treasury Wallet |
| --- | --- | --- | --- | --- |
| Ethereum Mainnet | [0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7](https://etherscan.io/address/0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7) | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x82c40c2921DC724c36FA89d0D6014C6D3DFb7c08 | 0x587b5eD0cc7a2a1BA8D39B9E3B50Fdf8665B4025 |
| Arbitrum Mainnet | [0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303](https://arbiscan.io/address/0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303) | 0xb2F19fCb213a9afEae5d706b7DD86C97dA3Ea165 | 0x7851bB23D54Bc032A3eb82F4cCCCAD4287Ab62a4 | 0x403F9B3F78f55a33179DEAC7F9296A0Cd9068F2d |
| Avalanche Mainnet | [0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7](https://snowtrace.io/address/0x6E8B146AF16429b037ecE5943F3c0E5f412ddFA7) | 0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303 | 0x524A6E0421D9bF2524d9f13595df1aefE2571A6A | 0x008646fE3F8D704C888768d9F3e10710429eE0D3 |
| Base Mainnet | [0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303](https://basescan.org/address/0xc4c2EdE4F6fD623ACc86C492BDF099b3bA2B8303) | 0xb2F19fCb213a9afEae5d706b7DD86C97dA3Ea165 | 0x72c41E6A7F83dB2557092814299Ea5129111Cf75 | 0xFe1113EE3d83DEE394D12B46082AEa47391DC3c1 |

## Notes for Auditors

- New deployments will include compiler settings and bytecode hashes in the corresponding `deployments/*.json` for reproducibility.
- Historical deployments may not contain this metadata; behavior and storage layout are consistent with `contracts/MEXAS.sol`.
