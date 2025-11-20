import { ethers, upgrades, network, artifacts } from "hardhat";
import * as fs from "fs";
import { MEXAS } from "../typechain-types";
import { getNetworkConfig, getTokenConfig, type Network } from "../config";

// Get network configuration
function getConfig() {
  const networkName = network.name as Network;

  console.log(`Loading configuration for ${networkName}...`);

  // Validate network is supported
  const supportedNetworks: Network[] = [
    "ethereumMainnet", "arbitrumMainnet", "polygonMainnet",
    "avalancheMainnet", "baseMainnet", "bscMainnet", "arbitrumSepolia", "hardhat"
  ];

  if (!supportedNetworks.includes(networkName)) {
    throw new Error(`Unsupported network: ${network.name}. Supported: ${supportedNetworks.join(", ")}`);
  }

  const networkConfig = getNetworkConfig(networkName);
  if (!networkConfig.ownerAddress || !networkConfig.deployerAddress || !networkConfig.deployPrivateKey) {
    throw new Error(`Missing environment variables for ${networkName}`);
  }

  return {
    ownerAddress: networkConfig.ownerAddress,
    deployer: networkConfig.deployerAddress,
  };
}

export async function deployMexas(
  initialSupply: string,
  ownerOverride?: string,
  nameOverride?: string,
  symbolOverride?: string,
): Promise<{ proxy: string; implementation: string; txHash?: string; }> {
  console.log(`Deploying MEXAS token to ${network.name}...`);

  // Get and validate configuration
  const { ownerAddress, deployer } = getConfig();
  const tokenConfig = getTokenConfig();
  const resolvedOwner = ownerOverride || ownerAddress!;
  const resolvedName = nameOverride || tokenConfig.name;
  const resolvedSymbol = symbolOverride || tokenConfig.symbol;

  // Deploy contract
  const mexa_contract = await ethers.getContractFactory("MEXAS");
  const supply = ethers.parseUnits(initialSupply, 6);
  const mexas: MEXAS = await upgrades.deployProxy(mexa_contract, [resolvedName, resolvedSymbol, supply, resolvedOwner], {
    kind: "uups",
    initializer: "initialize",
  });

  // Wait for deployment
  await mexas.waitForDeployment();
  const proxyAddress = await mexas.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  // Extract compiler settings and bytecode metadata for reproducibility
  const buildInfoPaths = (await artifacts.getBuildInfoPaths?.()) || [];
  let solcVersion: string | undefined;
  let optimizer: { enabled: boolean; runs?: number } | undefined;
  let evmVersion: string | undefined;
  let metadataHash: string | undefined;
  try {
    for (const p of buildInfoPaths) {
      const info = JSON.parse(fs.readFileSync(p, "utf8"));
      solcVersion = info.solcVersion ?? solcVersion;
      const settings = info.input?.settings || {};
      if (settings.optimizer) optimizer = settings.optimizer;
      if (settings.evmVersion) evmVersion = settings.evmVersion;
      // metadata: compiler output (ipfs or bzzr1) content hash
      const output = info.output || {};
      const files = output.contracts || {};
      for (const file of Object.keys(files)) {
        if (files[file]["MEXAS"]) {
          const meta = files[file]["MEXAS"].metadata;
          if (meta) {
            const parsed = JSON.parse(meta);
            metadataHash = parsed.settings?.metadata?.bytecodeHash || metadataHash;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not parse build info for compiler metadata:", (e as Error).message);
  }

  // Derive bytecode hashes
  const implBytecode = await ethers.provider.getCode(implementationAddress);
  const proxyBytecode = await ethers.provider.getCode(proxyAddress);
  const implBytecodeHash = ethers.keccak256(implBytecode);
  const proxyBytecodeHash = ethers.keccak256(proxyBytecode);

  // Wait for confirmations
  const confirmations = 2;
  console.log(`\nWaiting for ${confirmations} confirmations...`);
  await mexas.deploymentTransaction()?.wait(confirmations);
  console.log("Deployment confirmed");

  const tokenMetadata = {
    name: resolvedName,
    symbol: resolvedSymbol,
    decimals: 6,
  };

  const now = new Date();
  // Format: YYYY-MM-DD HH:MM:SS
  const deploymentDate = now.toISOString().split("T")[0] + " " + now.toISOString().split("T")[1].split(".")[0];

  const deploymentInfo = {
    network: network.name,
    proxy: proxyAddress,
    implementation: implementationAddress,
    owner: resolvedOwner,
    deployer: deployer,
    initialSupply: supply.toString(),
    version: "1.0.0",
    transactionHash: mexas.deploymentTransaction()?.hash,
    compiler: {
      solcVersion: solcVersion || "0.8.28",
      optimizer,
      evmVersion,
      metadataHash: metadataHash || "ipfs",
    },
    bytecode: {
      proxyHash: proxyBytecodeHash,
      implementationHash: implBytecodeHash,
    },
    tokenMetadata,
    deploymentDate: deploymentDate,
  };

  // Create a clean summary for console display (like original)
  const deploymentSummary = {
    network: network.name,
    proxy: proxyAddress,
    implementation: implementationAddress,
    owner: resolvedOwner,
    deployer: deployer,
    initialSupply: supply.toString(),
    version: "1.0.0",
    transactionHash: mexas.deploymentTransaction()?.hash,
    tokenMetadata: `Name: ${tokenMetadata.name} | Symbol: ${tokenMetadata.symbol} | Decimals: ${tokenMetadata.decimals}`,
    deploymentDate: deploymentDate,
  };

  console.log("\nDeployment Summary");
  console.table(deploymentSummary);

  // Include transaction hash prefix for unique filenames
  const fileName = `deployments/${network.name}-${deploymentDate.replace(/\s/g, "-")}-${deploymentInfo.transactionHash?.slice(0, 6)}.json`;
  fs.writeFileSync(fileName, JSON.stringify({ ...deploymentInfo, tokenMetadata }, null, 2));
  console.log(`\nDeployment info saved to ${fileName}`);
  return { proxy: proxyAddress, implementation: implementationAddress, txHash: mexas.deploymentTransaction()?.hash };
}
