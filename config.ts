import * as dotenv from "dotenv";

dotenv.config();

export type Network =
  | "ethereumMainnet"
  | "arbitrumSepolia"
  | "arbitrumMainnet"
  | "polygonMainnet"
  | "avalancheMainnet"
  | "baseMainnet"
  | "hardhat";

interface ScannerConfig {
  url?: string;
}

interface NetworkConfig {
  ownerAddress?: string;
  deployerAddress?: string;
  deployPrivateKey?: string;
  proxyAddress?: string;
  treasuryAddress?: string;
  scanner?: ScannerConfig;
}

interface TokenConfig {
  name: string;
  symbol: string;
}

function getEnv(key: string, fallback?: string): string | undefined {
  const v = process.env[key];
  return v !== undefined && v !== "" ? v : fallback;
}

export function getNetworkConfig(network: Network): NetworkConfig {
  switch (network) {
    case "ethereumMainnet":
      return {
        ownerAddress: getEnv("ETH_MAINNET_OWNER_ADDRESS"),
        deployerAddress: getEnv("ETH_MAINNET_DEPLOYER_ADDRESS"),
        deployPrivateKey: getEnv("ETH_MAINNET_DEPLOY_PRIVATE_KEY"),
        proxyAddress: getEnv("ETH_MAINNET_PROXY_ADDRESS"),
        treasuryAddress: getEnv("ETH_MAINNET_TREASURY_ADDRESS"),
        scanner: { url: getEnv("ETHERSCAN_URL") },
      };
    case "arbitrumSepolia":
      return {
        ownerAddress: getEnv("ARB_SEPOLIA_OWNER_ADDRESS"),
        deployerAddress: getEnv("ARB_SEPOLIA_DEPLOYER_ADDRESS"),
        deployPrivateKey: getEnv("ARB_SEPOLIA_DEPLOY_PRIVATE_KEY"),
        proxyAddress: getEnv("ARB_SEPOLIA_PROXY_ADDRESS"),
        treasuryAddress: getEnv("ARB_SEPOLIA_TREASURY_ADDRESS"),
        scanner: { url: getEnv("ARBISCAN_SEPOLIA_URL") },
      };
    case "arbitrumMainnet":
      return {
        ownerAddress: getEnv("ARB_MAINNET_OWNER_ADDRESS"),
        deployerAddress: getEnv("ARB_MAINNET_DEPLOYER_ADDRESS"),
        deployPrivateKey: getEnv("ARB_MAINNET_DEPLOY_PRIVATE_KEY"),
        proxyAddress: getEnv("ARB_MAINNET_PROXY_ADDRESS"),
        treasuryAddress: getEnv("ARB_MAINNET_TREASURY_ADDRESS"),
        scanner: { url: getEnv("ARBISCAN_URL") },
      };
    case "polygonMainnet":
      return {
        ownerAddress: getEnv("POLYGON_MAINNET_OWNER_ADDRESS"),
        deployerAddress: getEnv("POLYGON_MAINNET_DEPLOYER_ADDRESS"),
        deployPrivateKey: getEnv("POLYGON_MAINNET_DEPLOY_PRIVATE_KEY"),
        proxyAddress: getEnv("POLYGON_MAINNET_PROXY_ADDRESS"),
        treasuryAddress: getEnv("POLYGON_MAINNET_TREASURY_ADDRESS"),
        scanner: { url: getEnv("POLYGONSCAN_URL") },
      };
    case "avalancheMainnet":
      return {
        ownerAddress: getEnv("AVALANCHE_MAINNET_OWNER_ADDRESS"),
        deployerAddress: getEnv("AVALANCHE_MAINNET_DEPLOYER_ADDRESS"),
        deployPrivateKey: getEnv("AVALANCHE_MAINNET_DEPLOY_PRIVATE_KEY"),
        proxyAddress: getEnv("AVALANCHE_MAINNET_PROXY_ADDRESS"),
        treasuryAddress: getEnv("AVALANCHE_MAINNET_TREASURY_ADDRESS"),
        scanner: { url: getEnv("AVALANCHE_MAINNET_SCANNER_URL") },
      };
    case "baseMainnet":
      return {
        ownerAddress: getEnv("BASE_MAINNET_OWNER_ADDRESS"),
        deployerAddress: getEnv("BASE_MAINNET_DEPLOYER_ADDRESS"),
        deployPrivateKey: getEnv("BASE_MAINNET_DEPLOY_PRIVATE_KEY"),
        proxyAddress: getEnv("BASE_MAINNET_PROXY_ADDRESS"),
        treasuryAddress: getEnv("BASE_MAINNET_TREASURY_ADDRESS"),
        scanner: { url: getEnv("BASESCAN_URL") },
      };
    case "hardhat":
    default:
      return {
        ownerAddress: "0x000000000000000000000000000000000000dead",
        deployerAddress: "0x000000000000000000000000000000000000beef",
        deployPrivateKey: "0x0123456789012345678901234567890123456789012345678901234567890123",
      };
  }
}

export function getTokenConfig(): TokenConfig {
  return {
    name: getEnv("TOKEN_NAME", "MEXAS Stablecoin") || "MEXAS Stablecoin",
    symbol: getEnv("TOKEN_SYMBOL", "MEX") || "MEX",
  };
}

export function hasScanner(network: Network): boolean {
  const n = getNetworkConfig(network);
  return !!n.scanner && !!n.scanner.url;
}

export function getScannerConfig(network: Network): ScannerConfig | undefined {
  return getNetworkConfig(network).scanner;
}

export default {
  getNetworkConfig,
  getTokenConfig,
  hasScanner,
  getScannerConfig,
};
