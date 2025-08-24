// test/02-transfers.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";

describe("MEXAS Token - Transfer Functionality", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Basic Transfer Operations", () => {
    it("Should correctly transfer tokens between accounts", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      // Test direct transfer
      await mexas.transfer(await user1.getAddress(), amount);
      expect(await mexas.balanceOf(await user1.getAddress())).to.equal(amount);
      expect(await mexas.balanceOf(await owner.getAddress())).to.equal(
        (await mexas.totalSupply()) - amount,
      );

      // Test transferFrom with approval
      await mexas.connect(user1).approve(await owner.getAddress(), amount);
      await mexas.transferFrom(
        await user1.getAddress(),
        await user2.getAddress(),
        amount,
      );
      expect(await mexas.balanceOf(await user2.getAddress())).to.equal(amount);
      expect(await mexas.balanceOf(await user1.getAddress())).to.equal(0);
    });

    it("Should emit Transfer event on successful transfers", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const ownerAddr = await owner.getAddress();
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // Test event on direct transfer
      await expect(mexas.transfer(user1Addr, amount))
        .to.emit(mexas, "Transfer")
        .withArgs(ownerAddr, user1Addr, amount);

      // Test event on transferFrom
      await mexas.connect(user1).approve(ownerAddr, amount);
      await expect(mexas.transferFrom(user1Addr, user2Addr, amount))
        .to.emit(mexas, "Transfer")
        .withArgs(user1Addr, user2Addr, amount);
    });

    it("Should emit Transfer event on all transfer types", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const ownerAddr = await owner.getAddress();
      const user1Addr = await user1.getAddress();

      // Test mint transfer event
      await expect(mexas.mint(user1Addr, amount))
        .to.emit(mexas, "Transfer")
        .withArgs(ethers.ZeroAddress, user1Addr, amount);

      // Test burn transfer event
      await mexas.transfer(user1Addr, amount);
      await expect(mexas.connect(user1).burn(amount))
        .to.emit(mexas, "Transfer")
        .withArgs(user1Addr, ethers.ZeroAddress, amount);
    });

    it("Should update allowances correctly on transferFrom", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const ownerAddr = await owner.getAddress();
      const user1Addr = await user1.getAddress();

      // Setup
      await mexas.transfer(user1Addr, amount);
      await mexas.connect(user1).approve(ownerAddr, amount);

      // Check initial allowance
      expect(await mexas.allowance(user1Addr, ownerAddr)).to.equal(amount);

      // Perform transferFrom and verify allowance is reduced
      const transferAmount = amount / 2n;
      await mexas.transferFrom(
        user1Addr,
        await user2.getAddress(),
        transferAmount,
      );
      expect(await mexas.allowance(user1Addr, ownerAddr)).to.equal(
        amount - transferAmount,
      );
    });
  });

  describe("Transfer Validations", () => {
    it("Should revert transfers with insufficient balance", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // Test direct transfer
      await mexas.transfer(user1Addr, amount);
      await expect(
        mexas.connect(user1).transfer(user2Addr, amount * 2n),
      ).to.be.revertedWithCustomError(mexas, "ERC20InsufficientBalance");

      // Test transferFrom
      await mexas.connect(user1).approve(user2Addr, amount * 2n);
      await expect(
        mexas.connect(user2).transferFrom(user1Addr, user2Addr, amount * 2n),
      ).to.be.revertedWithCustomError(mexas, "ERC20InsufficientBalance");
    });

    it("Should prevent transfers to contract address", async () => {
      const { mexas } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const contractAddr = await mexas.getAddress();

      // Test direct transfer to contract
      await expect(
        mexas.transfer(contractAddr, amount),
      ).to.be.revertedWithCustomError(mexas, "TransferToContractNotAllowed");

      // Test transferFrom to contract
      await mexas.approve(await mexas.owner(), amount);
      await expect(
        mexas.transferFrom(await mexas.owner(), contractAddr, amount),
      ).to.be.revertedWithCustomError(mexas, "TransferToContractNotAllowed");
    });

    it("Should prevent transferFrom without sufficient allowance", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const user1Addr = await user1.getAddress();
      const user2Addr = await user2.getAddress();

      // Setup: Give user1 tokens but don't approve user2
      await mexas.transfer(user1Addr, amount);

      // Attempt transferFrom without approval
      await expect(
        mexas.connect(user2).transferFrom(user1Addr, user2Addr, amount),
      ).to.be.revertedWithCustomError(mexas, "ERC20InsufficientAllowance");
    });
  });

  describe("Update Function Edge Cases", () => {
    it("Should prevent transfers from blacklisted sender during _update", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.transfer(user1.getAddress(), amount);
      await mexas.addToBlockedList(user1.getAddress());

      await expect(
        mexas.connect(user1).transfer(user2.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should prevent minting to blacklisted recipient in _update", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.addToBlockedList(user1.getAddress());
      await expect(
        mexas.mint(user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should verify both from and to addresses in _update", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      // Block both addresses
      await mexas.transfer(user1.getAddress(), amount);
      await mexas.addToBlockedList(user1.getAddress());
      await mexas.addToBlockedList(user2.getAddress());

      await expect(
        mexas.connect(user1).transfer(user2.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });
  });
});
