import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getNetworkConfig, type Network } from "../config";

const TOKEN_DECIMALS = 6; // MEXAS uses 6 decimals
const TRANSACTIONS_DIR = "transactions";

export async function prepareMintTx(
  amount: string,
): Promise<string> {
  // Create transactions directory if it doesn't exist
  if (!fs.existsSync(TRANSACTIONS_DIR)) {
    fs.mkdirSync(TRANSACTIONS_DIR);
  }

  const networkName = network.name as Network;
  const networkConfig = getNetworkConfig(networkName);

  if (!networkConfig.proxyAddress) throw new Error("Proxy address is missing in network config");
  if (!networkConfig.treasuryAddress) throw new Error("Treasury address is missing in network config");

  if (!amount) throw new Error("Missing amount parameter");

  const amountInUnits = ethers.parseUnits(amount, TOKEN_DECIMALS);

  const iface = new ethers.Interface(["function mint(address destination, uint256 amount)"]);

  const data = iface.encodeFunctionData("mint", [networkConfig.treasuryAddress, amountInUnits]);

  const safeTx = {
    to: networkConfig.proxyAddress,
    value: "0", // mint() doesn't send ETH
    data: data,
    operation: 0, // CALL (not DELEGATECALL)
    safeTxGas: 100_000, // Required to bypass GS013 on SafeL2 (Arbitrum, Polygon, Base)
    baseGas: 0,
    gasPrice: 0,
    gasToken: "0x0000000000000000000000000000000000000000",
    refundReceiver: "0x0000000000000000000000000000000000000000",
  };

  // Decode back for user confirmation
  const decoded = iface.decodeFunctionData("mint", data);

  console.log("✅ Transaction Details");
  console.log("  To (MEXAS Proxy):", networkConfig.proxyAddress);
  console.log("  Destination Address:", decoded[0]);
  console.log("  Amount (raw units):", decoded[1].toString());
  console.log("  Amount (human-readable):", ethers.formatUnits(decoded[1], TOKEN_DECIMALS), "MEXAS");

  // Prepare file name (shortened address and timestamp)
  const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19); // date + time
  const destShort = `${networkConfig.treasuryAddress.slice(0, 6)}...${networkConfig.treasuryAddress.slice(-4)}`;
  const fileName = `${network.name.replace("_", "-")}-mexas-mint-${amount}MEXAS-to-${destShort}-${date}.json`;

  // Write transaction file in transactions directory
  const filePath = `${TRANSACTIONS_DIR}/${fileName}`;
  fs.writeFileSync(filePath, JSON.stringify(safeTx, null, 2));

  console.log(`✅ Transaction prepared and saved to: ${filePath}`);
  return filePath;
}
