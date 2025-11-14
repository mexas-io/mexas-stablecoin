import { ethers, network, upgrades } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { getScannerConfig, getNetworkConfig, type Network } from "../config";

type DeploymentRecord = {
  network: string;
  proxy: string;
  implementation?: string;
  owner?: string;
  deployer?: string;
  initialSupply?: string;
  transactionHash?: string;
};

const MEXAS_MIN_ABI = [
  "function owner() view returns (address)",
];

const SAFE_MIN_ABI = [
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
];

function loadDeploymentForNetwork(target: string): DeploymentRecord | undefined {
  const dir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(dir)) return undefined;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const candidates: DeploymentRecord[] = [];
  for (const f of files) {
    try {
      const data: DeploymentRecord = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (data && data.network === target) candidates.push(data);
    } catch {}
  }
  // Pick the latest by filename timestamp ordering
  candidates.sort((a, b) => 0);
  return candidates.at(-1);
}

async function tryReadSafeInfo(address: string) {
  try {
    const contract = new ethers.Contract(address, SAFE_MIN_ABI, ethers.provider);
    const [owners, threshold] = await Promise.all([
      contract.getOwners(),
      contract.getThreshold(),
    ]);
    return { owners, threshold: Number(threshold) };
  } catch {
    return undefined;
  }
}

function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

async function main() {
  const networkName = network.name as Network;
  const scanner = getScannerConfig(networkName);
  const cfg = getNetworkConfig(networkName);

  console.log(`\n=== Auditing deployment on ${networkName} ===`);

  const record = loadDeploymentForNetwork(networkName);
  if (!record || !record.proxy) {
    throw new Error(`No deployment record found for ${networkName} in deployments/*.json`);
  }

  const proxy = ethers.getAddress(record.proxy);
  const code = await ethers.provider.getCode(proxy);
  console.log(`Proxy: ${proxy} ${code === "0x" ? "(NOT DEPLOYED)" : "(code found)"}`);
  if (scanner) console.log(`  Explorer: ${scanner.url}/address/${proxy}`);

  // ERC1967 implementation
  let implOnChain = "";
  try {
    implOnChain = await upgrades.erc1967.getImplementationAddress(proxy);
    console.log(`Implementation (on-chain): ${implOnChain}`);
  } catch (e) {
    console.log(`Implementation (on-chain): <error> ${(e as Error).message}`);
  }
  if (record.implementation) {
    const match = record.implementation.toLowerCase() === implOnChain.toLowerCase();
    console.log(`  Matches deployments JSON: ${match ? "YES" : "NO"}`);
  }

  // Owner()
  try {
    const mexas = new ethers.Contract(proxy, MEXAS_MIN_ABI, ethers.provider);
    const owner = await mexas.owner();
    console.log(`Owner (on-chain): ${owner}`);
    if (record.owner) {
      const match = record.owner.toLowerCase() === owner.toLowerCase();
      console.log(`  Matches deployments JSON: ${match ? "YES" : "NO"}`);
    }

    const issuerSafe = await tryReadSafeInfo(owner);
    if (issuerSafe) {
      console.log(`  Gnosis Safe detected: threshold=${issuerSafe.threshold}, owners=${issuerSafe.owners.length}`);
      // console.log(`  Owners: ${issuerSafe.owners.map(short).join(", ")}`);
      console.log(`  Owners: ${issuerSafe.owners.join(", ")}`);
    } else {
      console.log("  Owner is not a Gnosis Safe (no Safe interface detected)");
    }
  } catch (e) {
    console.log(`Owner (on-chain): <error> ${(e as Error).message}`);
  }

  // Treasury (from config if present)
  if (cfg.treasuryAddress) {
    const treasury = ethers.getAddress(cfg.treasuryAddress);
    console.log(`Treasury (from config): ${treasury}`);
    const treasurySafe = await tryReadSafeInfo(treasury);
    if (treasurySafe) {
      console.log(`  Gnosis Safe detected: threshold=${treasurySafe.threshold}, owners=${treasurySafe.owners.length}`);
      // console.log(`  Owners: ${treasurySafe.owners.map(short).join(", ")}`);
      console.log(`  Owners: ${treasurySafe.owners.join(", ")}`);
    }
  } else {
    console.log("Treasury (from config): not set");
  }

  // Links
  if (scanner && record.transactionHash) {
    console.log(`Tx: ${scanner.url}/tx/${record.transactionHash}`);
  }

  console.log("\nAudit complete.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


