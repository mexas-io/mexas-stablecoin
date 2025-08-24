// test/07-ownership.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";

describe("MEXAS Token - Ownership", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Ownership Control", () => {
    it("Should initialize with correct owner", async () => {
      const { mexas, owner } = await loadFixture(fixture);
      expect(await mexas.owner()).to.equal(await owner.getAddress());
    });

    it("Should transfer ownership with correct privilege transition", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const newOwner = await user1.getAddress();
      const amount = ethers.parseUnits("1000", 6);

      // Initial owner can perform privileged operations
      await expect(mexas.mint(newOwner, amount)).to.not.be.reverted;

      // Transfer ownership
      await expect(mexas.transferOwnership(newOwner))
        .to.emit(mexas, "OwnershipTransferred")
        .withArgs(await owner.getAddress(), newOwner);
      expect(await mexas.owner()).to.equal(newOwner);

      // Previous owner loses privileges
      await expect(mexas.mint(newOwner, amount)).to.be.revertedWithCustomError(
        mexas,
        "OwnableUnauthorizedAccount",
      );

      // New owner gains privileges
      await expect(mexas.connect(user1).mint(newOwner, amount)).to.not.be
        .reverted;
    });

    it("Should prevent transferring to current owner", async () => {
      const { mexas, owner } = await loadFixture(fixture);
      await expect(
        mexas.transferOwnership(await owner.getAddress()),
      ).to.be.revertedWithCustomError(mexas, "OwnableInvalidOwner");
    });

    it("Should handle transferOwnership edge cases", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);

      // First try transferring to zero address
      await expect(
        mexas.transferOwnership(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(mexas, "OwnableInvalidOwner");

      // Now do a successful transfer
      await mexas.transferOwnership(await user1.getAddress());

      // Try transferring while not being owner anymore
      await expect(
        mexas.transferOwnership(await user2.getAddress()),
      ).to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount");
    });

    it("Should prevent transferring ownership to a blacklisted address", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      await mexas.addToBlockedList(await user1.getAddress());
      await expect(
        mexas.transferOwnership(await user1.getAddress()),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });
  });

  describe("Owner-Restricted Operations", () => {
    it("Should enforce owner-only access for all privileged operations", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // Test all owner-restricted operations
      await expect(
        mexas.connect(user1).mint(user2Addr, amount),
      ).to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount");

      await expect(
        mexas.connect(user1).redeem(amount),
      ).to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount");

      await expect(mexas.connect(user1).pause()).to.be.revertedWithCustomError(
        mexas,
        "OwnableUnauthorizedAccount",
      );

      await expect(mexas.connect(user1).unpause()).to.be.revertedWithCustomError(
        mexas,
        "OwnableUnauthorizedAccount",
      );

      await expect(
        mexas.connect(user1).addToBlockedList(user2Addr),
      ).to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount");

      await expect(
        mexas.connect(user1).removeFromBlockedList(user2Addr),
      ).to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount");

      await expect(
        mexas.connect(user1).destroyBlockedFunds(user2Addr),
      ).to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount");
    });
  });
});
