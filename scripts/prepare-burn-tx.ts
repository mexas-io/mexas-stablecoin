import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getNetworkConfig, type Network } from "../config";

const TOKEN_DECIMALS = 6;
const TRANSACTIONS_DIR = "transactions";

export async function prepareBurnTx(
  amount: string,
): Promise<string> {
  if (!fs.existsSync(TRANSACTIONS_DIR)) {
    fs.mkdirSync(TRANSACTIONS_DIR);
  }

  const networkName = network.name as Network;
  const networkConfig = getNetworkConfig(networkName);

  if (!networkConfig.proxyAddress) throw new Error("Proxy address is missing in network config");
  if (!amount) throw new Error("Missing amount parameter");

  const amountInUnits = ethers.parseUnits(amount, TOKEN_DECIMALS);
  const iface = new ethers.Interface(["function redeem(uint256 amount)"]);

  const data = iface.encodeFunctionData("redeem", [amountInUnits]);

  const safeTx = {
    to: networkConfig.proxyAddress,
    value: "0",
    data,
    operation: 0, // CALL (not DELEGATECALL)
    safeTxGas: 100_000, // Required to bypass GS013 on SafeL2 (Arbitrum, Polygon, Base)
    baseGas: 0,
    gasPrice: 0,
    gasToken: "0x0000000000000000000000000000000000000000",
    refundReceiver: "0x0000000000000000000000000000000000000000",
  };

  const decoded = iface.decodeFunctionData("redeem", data);

  console.log("✅ Burn Transaction Details");
  console.log("  To (MEXAS Proxy):", networkConfig.proxyAddress);
  console.log("  Amount (raw units):", decoded[0].toString());
  console.log("  Amount (human-readable):", ethers.formatUnits(decoded[0], TOKEN_DECIMALS), "MEXAS");

  const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `${networkName}-mexas-burn-${amount}MEXAS-${date}.json`;

  const filePath = `${TRANSACTIONS_DIR}/${fileName}`;
  fs.writeFileSync(filePath, JSON.stringify(safeTx, null, 2));

  console.log(`✅ Burn transaction saved to: ${filePath}`);
  return filePath;
}
