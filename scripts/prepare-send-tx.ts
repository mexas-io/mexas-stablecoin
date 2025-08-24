import { ethers, network } from "hardhat";
import * as fs from "fs";
import { getNetworkConfig, type Network } from "../config";

const TOKEN_DECIMALS = 6;
const TRANSACTIONS_DIR = "transactions";

export async function prepareSendTx(
  to: string,
  amount: string,
): Promise<string> {
  if (!fs.existsSync(TRANSACTIONS_DIR)) {
    fs.mkdirSync(TRANSACTIONS_DIR);
  }

  const networkName = network.name as Network;
  const networkConfig = getNetworkConfig(networkName);

  if (!networkConfig.proxyAddress) throw new Error("Proxy address is missing in network config");
  if (!to) throw new Error("Missing recipient address parameter");
  if (!amount) throw new Error("Missing amount parameter");

  const amountInUnits = ethers.parseUnits(amount, TOKEN_DECIMALS);
  const iface = new ethers.Interface(["function transfer(address to, uint256 amount)"]);

  const data = iface.encodeFunctionData("transfer", [to, amountInUnits]);

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

  const decoded = iface.decodeFunctionData("transfer", data);

  console.log("✅ Send Transaction Details");
  console.log("  To (MEXAS Proxy):", networkConfig.proxyAddress);
  console.log("  Recipient Address:", decoded[0]);
  console.log("  Amount (raw units):", decoded[1].toString());
  console.log("  Amount (human-readable):", ethers.formatUnits(decoded[1], TOKEN_DECIMALS), "MEXAS");

  const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const recipientShort = `${to.slice(0, 6)}...${to.slice(-4)}`;
  const fileName = `${networkName}-mexas-send-${amount}MEXAS-to-${recipientShort}-${date}.json`;

  const filePath = `${TRANSACTIONS_DIR}/${fileName}`;
  fs.writeFileSync(filePath, JSON.stringify(safeTx, null, 2));

  console.log(`✅ Send transaction saved to: ${filePath}`);
  return filePath;
}
