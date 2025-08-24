import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/config";
import "./tasks/mexas";
import { getNetworkConfig } from "./config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
      metadata: { bytecodeHash: "ipfs" },
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "metadata",
            "storageLayout"
          ]
        }
      }
    }
  },
  mocha: {
    timeout: 120000,
  },
  networks: {
    ethereumMainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
      accounts: getNetworkConfig("ethereumMainnet").deployPrivateKey ? [getNetworkConfig("ethereumMainnet").deployPrivateKey as string] : [],
    },
    arbitrumSepolia: {
      url: `https://arbitrum-sepolia.infura.io/v3/${process.env.RPC_API_KEY}`,
      accounts: getNetworkConfig("arbitrumSepolia").deployPrivateKey ? [getNetworkConfig("arbitrumSepolia").deployPrivateKey as string] : [],
    },
    arbitrumMainnet: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
      accounts: getNetworkConfig("arbitrumMainnet").deployPrivateKey ? [getNetworkConfig("arbitrumMainnet").deployPrivateKey as string] : [],
    },
    polygonMainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
      accounts: getNetworkConfig("polygonMainnet").deployPrivateKey ? [getNetworkConfig("polygonMainnet").deployPrivateKey as string] : [],
    },
    avalancheMainnet: {
      url: `https://avalanche-mainnet.infura.io/v3/${process.env.RPC_API_KEY}`,
      accounts: getNetworkConfig("avalancheMainnet").deployPrivateKey ? [getNetworkConfig("avalancheMainnet").deployPrivateKey as string] : [],
    },
    baseMainnet: {
      url: `https://mainnet.base.org`,
      accounts: getNetworkConfig("baseMainnet").deployPrivateKey ? [getNetworkConfig("baseMainnet").deployPrivateKey as string] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: ["0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"],
    },
  },
  etherscan: {
    // Etherscan v2: single API key used across supported networks
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
