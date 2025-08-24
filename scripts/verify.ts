import { network } from "hardhat";
import { getNetworkConfig, getScannerConfig, type Network } from "../config";

interface VerificationError extends Error {
  message: string;
  code?: string;
}

export async function verifyMexas(address: string, networkName: Network) {
  const networkConfig = getNetworkConfig(networkName);
  const scannerConfig = getScannerConfig(networkName);

  if (!scannerConfig) {
    throw new Error(`No scanner configuration available for network ${networkName}`);
  }

  console.log(`\n🔍 Verifying contract on ${networkName}...`);
  console.log(`Contract address: ${address}`);
  console.log(`Scanner URL: ${scannerConfig.url}`);

  try {
    await require("hardhat").run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("\n✅ Contract verified successfully!");
    console.log(`View on ${networkName}: ${scannerConfig.url}/address/${address}#code`);
  } catch (error) {
    const err = error as VerificationError;

    // Handle already verified case
    if (err.message.includes("Already Verified")) {
      console.log("\nℹ️ Contract is already verified.");
      console.log("This is normal with UUPS proxies - OpenZeppelin reuses implementations with identical bytecode.");
      console.log(`View on ${networkName}: ${scannerConfig.url}/address/${address}#code`);
      return;
    }

    // Handle verification failure
    console.warn("\n⚠️ Verification failed. Error:", err.message);
    console.log("\n📝 To verify manually:");
    console.log(`1. Wait a few minutes for ${networkName} to index the contract`);
    console.log(`2. Run: npx hardhat verify --network ${networkName} ${address}`);

    // Additional network-specific instructions
    switch (networkName) {
      case "arbitrumMainnet":
        console.log("\nℹ️ Note: Arbitrum verification may take up to 5 minutes to appear on the explorer");
        break;
      case "arbitrumSepolia":
        console.log("\nℹ️ Note: Arbitrum verification may take up to 5 minutes to appear on the explorer");
        break;
      case "polygonMainnet":
        console.log("\nℹ️ Note: Polygon verification may take up to 10 minutes to appear on the explorer");
        break;
      case "ethereumMainnet":
        console.log("\nℹ️ Note: Ethereum verification may take up to 15 minutes to appear on the explorer");
        break;
    }
  }
}

export async function verifyMexasProxyFromConfig(): Promise<void> {
  const networkName = network.name as Network;
  const networkConfig = getNetworkConfig(networkName);
  if (!networkConfig.proxyAddress) throw new Error(`No proxy address configured for network ${networkName}`);
  await verifyMexas(networkConfig.proxyAddress, networkName);
}
