import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// CLI parameters are mandatory for operational values
task("mexas:deploy", "Deploy MEXAS token contract")
  .addParam("initialSupply", "Initial token supply", undefined, types.string)
  .addOptionalParam("owner", "Owner address (defaults to network config owner)", undefined, types.string)
  .addOptionalParam("name", "Token name (defaults to config/token env)", undefined, types.string)
  .addOptionalParam("symbol", "Token symbol (defaults to config/token env)", undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { deployMexas } = await import("../scripts/deploy-mexas");
    await deployMexas(taskArgs.initialSupply, taskArgs.owner, taskArgs.name, taskArgs.symbol);
  });

task("mexas:prepare-mint", "Prepare mint transaction for Gnosis Safe (to treasury)")
  .addParam("amount", "Amount to mint", undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { prepareMintTx } = await import("../scripts/prepare-mint-tx");
    await prepareMintTx(taskArgs.amount);
  });

task("mexas:prepare-burn", "Prepare burn/redeem transaction for Gnosis Safe")
  .addParam("amount", "Amount to burn/redeem", undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { prepareBurnTx } = await import("../scripts/prepare-burn-tx");
    await prepareBurnTx(taskArgs.amount);
  });

task("mexas:prepare-send", "Prepare send transaction for Gnosis Safe")
  .addParam("to", "Recipient address", undefined, types.string)
  .addParam("amount", "Amount to send", undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { prepareSendTx } = await import("../scripts/prepare-send-tx");
    await prepareSendTx(taskArgs.to, taskArgs.amount);
  });

task("mexas:verify-contract", "Verify contract on block explorer")
  .addOptionalParam("address", "Contract address to verify (defaults to proxy from config)", undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { verifyMexas, verifyMexasProxyFromConfig } = await import("../scripts/verify");
    if (taskArgs.address) await verifyMexas(taskArgs.address, hre.network.name as any);
    else await verifyMexasProxyFromConfig();
  });

task("mexas:submit-tx", "Sign and submit prepared transaction (dev only, does not use multisig)")
  .addParam("file", "Transaction file to submit", undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { submitTx } = await import("../scripts/sign-and-submit");
    await submitTx(taskArgs.file);
  });

task("mexas:deployment-info", "Audit on-chain deployment: proxy, implementation, owner, and Safe details")
  .setAction(async (_taskArgs, hre: HardhatRuntimeEnvironment) => {
    await hre.run("run", { script: "scripts/deployment-info.ts" });
  });
