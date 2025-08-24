// test/04-supply.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";

describe("MEXAS Token - Supply Management", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Minting", () => {
    it("Should mint tokens correctly and emit event", async () => {
      const { mexas, user1, INITIAL_SUPPLY } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const userAddress = await user1.getAddress();

      // Check initial state
      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await mexas.balanceOf(userAddress)).to.equal(0);

      // Perform mint and verify event
      await expect(mexas.mint(userAddress, amount))
        .to.emit(mexas, "Mint")
        .withArgs(userAddress, amount);

      // Verify final state
      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY + amount);
      expect(await mexas.balanceOf(userAddress)).to.equal(amount);
    });

    it("Should enforce minting restrictions", async () => {
      const { mexas, user1, ZERO_ADDRESS } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const userAddress = await user1.getAddress();

      // Test zero address validation
      await expect(
        mexas.mint(ZERO_ADDRESS, amount),
      ).to.be.revertedWithCustomError(mexas, "ERC20InvalidReceiver");

      // Test blacklist validation
      await mexas.addToBlockedList(userAddress);
      await expect(mexas.mint(userAddress, amount)).to.be.revertedWithCustomError(
        mexas,
        "BlacklistedAddress",
      );
    });

    it("Should handle mint edge cases with blocked users", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      // Block recipient - this should prevent minting
      await mexas.addToBlockedList(await user1.getAddress());

      await expect(
        mexas.mint(await user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");

      // Block owner - should NOT prevent minting to unblocked address
      await mexas.addToBlockedList(await owner.getAddress());
      await expect(mexas.mint(await user2.getAddress(), amount)).to.not.be
        .reverted;
    });
  });

  describe("Burning", () => {
    it("Should burn tokens correctly and emit event", async () => {
      const { mexas, owner, INITIAL_SUPPLY } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const ownerAddress = await owner.getAddress();

      // Check initial state
      expect(await mexas.balanceOf(ownerAddress)).to.equal(INITIAL_SUPPLY);

      // Perform burn and verify event
      await expect(mexas.redeem(amount)).to.emit(mexas, "Redeem").withArgs(amount);

      // Verify final state
      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY - amount);
      expect(await mexas.balanceOf(ownerAddress)).to.equal(
        INITIAL_SUPPLY - amount,
      );
    });

    it("Should enforce burning restrictions", async () => {
      const { mexas, owner, INITIAL_SUPPLY } = await loadFixture(fixture);
      const ownerAddress = await owner.getAddress();

      // Test insufficient balance
      const excessAmount = INITIAL_SUPPLY + 1n;
      await expect(mexas.redeem(excessAmount))
        .to.be.revertedWithCustomError(mexas, "ERC20InsufficientBalance")
        .withArgs(ownerAddress, INITIAL_SUPPLY, excessAmount);
    });
  });

  describe("Blocked Funds", () => {
    it("Should handle blocked funds destruction correctly", async () => {
      const { mexas, user1, INITIAL_SUPPLY } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const userAddress = await user1.getAddress();

      // Setup: Transfer funds and block user
      await mexas.transfer(userAddress, amount);
      await mexas.addToBlockedList(userAddress);

      // Check pre-destruction state
      expect(await mexas.balanceOf(userAddress)).to.equal(amount);
      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY);

      // Perform destruction and verify event
      await expect(mexas.destroyBlockedFunds(userAddress))
        .to.emit(mexas, "DestroyedBlockedFunds")
        .withArgs(userAddress, amount);

      // Verify final state
      expect(await mexas.balanceOf(userAddress)).to.equal(0);
      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY - amount);
    });

    it("Should enforce blocked funds restrictions", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      // Test non-blacklisted address
      await expect(
        mexas.destroyBlockedFunds(user1Address),
      ).to.be.revertedWithCustomError(mexas, "NotBlacklisted");

      // Test blacklist requirement
      await mexas.transfer(user1Address, amount);
      await expect(
        mexas.destroyBlockedFunds(user1Address),
      ).to.be.revertedWithCustomError(mexas, "NotBlacklisted");
    });

    it("Should handle destroyBlockedFunds on zero-balance blocked address as a no-op", async () => {
      const { mexas, user2, INITIAL_SUPPLY } = await loadFixture(fixture);
      const user2Address = await user2.getAddress();

      // Block address with zero balance
      await mexas.addToBlockedList(user2Address);

      // Destroy should burn 0 and retain total supply
      await expect(mexas.destroyBlockedFunds(user2Address))
        .to.emit(mexas, "DestroyedBlockedFunds")
        .withArgs(user2Address, 0);

      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await mexas.balanceOf(user2Address)).to.equal(0);
    });

    it("Should revert destroyBlockedFunds while paused (covers pause gate)", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      await mexas.transfer(await user1.getAddress(), ethers.parseUnits("1", 6));
      await mexas.addToBlockedList(await user1.getAddress());
      await mexas.pause();
      await expect(
        mexas.destroyBlockedFunds(await user1.getAddress()),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");
    });
  });
});
