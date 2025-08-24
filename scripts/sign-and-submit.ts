import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getNetworkConfig, type Network } from "../config";

export async function submitTx(file: string): Promise<string> {
  if (!file) {
    throw new Error("Missing file parameter");
  }

  const networkName = network.name as Network;
  const networkConfig = getNetworkConfig(networkName);

  // Load transaction file
  const txData = JSON.parse(fs.readFileSync(file, "utf8"));

  console.log("📄 Loaded transaction file:");
  console.log(JSON.stringify(txData, null, 2));

  // Use Hardhat's injected provider and signer
  const [signer] = await ethers.getSigners();

  // Confirm signer address for safety
  console.log(`\n🔑 Using signer: ${await signer.getAddress()}`);

  // Build the transaction
  const tx = {
    to: txData.to,
    value: ethers.toBigInt(txData.value), // Assumes value is already in wei as string
    data: txData.data,
    gasLimit: 1_000_000, // Adjust if needed
  };

  console.log("\n✍️ Signing and sending transaction...");
  const sentTx = await signer.sendTransaction(tx);
  console.log(`✅ Transaction sent! Hash: ${sentTx.hash}`);

  console.log("\n⏳ Waiting for confirmation...");
  const receipt = await sentTx.wait(2);

  if (receipt) {
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  } else {
    console.log("❌ Transaction not confirmed after 2 blocks (receipt is null)");
  }
  console.log("📜 Transaction receipt:");
  console.log(JSON.stringify(receipt, null, 2));
  // Show explorer link based on network
  if (networkConfig.scanner) {
    console.log(`\n🔗 View on explorer: ${networkConfig.scanner.url}/tx/${sentTx.hash}`);
  }

  return sentTx.hash;
}
