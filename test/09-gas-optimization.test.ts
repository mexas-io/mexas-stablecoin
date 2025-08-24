// test/09-gas-optimization.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";
import { MEXAS } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MEXAS Token - Gas Optimization", function () {
  // Interfaces for tracking gas usage
  interface GasUsage {
    operation: string;
    gasUsed: bigint;
    description?: string;
  }

  interface TransferScenario {
    description: string;
    setup: (
      mexas: MEXAS,
      from: SignerWithAddress,
      to: SignerWithAddress,
      amount: bigint,
    ) => Promise<void>;
  }

  // Helper function to measure gas usage
  async function measureGas(
    operation: () => Promise<any>,
    operationName: string,
    description?: string,
  ): Promise<GasUsage> {
    const tx = await operation();
    const receipt = await tx.wait();
    return {
      operation: operationName,
      gasUsed: receipt?.gasUsed ?? 0n,
      description,
    };
  }

  // Helper to log gas comparisons
  function logGasComparison(baseline: GasUsage, comparison: GasUsage) {
    console.log(
      `\nGas Comparison - ${comparison.operation} vs ${baseline.operation}:`,
    );
    console.log(
      `Baseline (${baseline.operation}): ${baseline.gasUsed.toString()} gas`,
    );
    console.log(
      `Comparison (${
        comparison.operation
      }): ${comparison.gasUsed.toString()} gas`,
    );
    const diff = comparison.gasUsed - baseline.gasUsed;
    const percentage = (
      (Number(diff) / Number(baseline.gasUsed)) *
      100
    ).toFixed(2);
    console.log(`Difference: ${diff.toString()} gas (${percentage}%)`);
  }

  // Load the fixture before each test
  async function setupFixture() {
    const fixtureData = await loadFixture(deploymentFixture);
    return fixtureData;
  }

  describe("Blacklist Operation Gas Usage", () => {
    it("Should measure gas impact of transfers involving blacklist checks", async () => {
      const { mexas, owner, user1, user2 } = await setupFixture();
      const amount = ethers.parseUnits("1000", 6);

      // Transfer before any blacklist operations
      const transferBeforeBlacklist = await measureGas(async () => {
        const tx = await mexas.transfer(await user1.getAddress(), amount);
        return tx;
      }, "Transfer Before Blacklist");

      // Add some addresses to blacklist to simulate real conditions
      await mexas.addToBlockedList(await user2.getAddress());

      // Transfer after blacklist is populated
      const transferAfterBlacklist = await measureGas(async () => {
        const tx = await mexas.transfer(await user1.getAddress(), amount);
        return tx;
      }, "Transfer After Blacklist");

      logGasComparison(transferBeforeBlacklist, transferAfterBlacklist);
      // Difference should be minimal due to optimized checks
      expect(
        transferAfterBlacklist.gasUsed - transferBeforeBlacklist.gasUsed,
      ).to.be.lessThan(1000n);
    });
  });

  describe("Supply Management Gas Usage", () => {
    it("Should measure gas costs for mint operations", async () => {
      const { mexas, owner, user1 } = await setupFixture();
      const amount = ethers.parseUnits("1000", 6);

      const mintOp = await measureGas(async () => {
        const tx = await mexas.mint(await user1.getAddress(), amount);
        return tx;
      }, "Mint Operation");

      console.log(`\nGas used for mint operation: ${mintOp.gasUsed}`);
    });

    it("Should measure gas costs for burn operations", async () => {
      const { mexas, owner } = await setupFixture();
      const amount = ethers.parseUnits("1000", 6);

      const burnOp = await measureGas(async () => {
        const tx = await mexas.redeem(amount);
        return tx;
      }, "Burn Operation");

      console.log(`\nGas used for burn operation: ${burnOp.gasUsed}`);
    });
  });
});
