// test/05-pause.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";
import { MEXAS } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MEXAS Token - Pause Functionality", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Basic Pause Control", () => {
    it("Should pause contract and emit event", async () => {
      const { mexas } = await loadFixture(fixture);

      expect(await mexas.paused()).to.be.false;

      const owner = await mexas.owner();
      await expect(mexas.pause()).to.emit(mexas, "Paused").withArgs(owner);

      expect(await mexas.paused()).to.be.true;
    });

    it("Should unpause contract and emit event", async () => {
      const { mexas } = await loadFixture(fixture);

      await mexas.pause();
      expect(await mexas.paused()).to.be.true;

      const owner = await mexas.owner();
      await expect(mexas.unpause()).to.emit(mexas, "Unpaused").withArgs(owner);

      expect(await mexas.paused()).to.be.false;
    });

    it("Should enforce pause state transitions", async () => {
      const { mexas } = await loadFixture(fixture);

      // Cannot unpause when not paused
      await expect(mexas.unpause()).to.be.revertedWithCustomError(
        mexas,
        "ExpectedPause",
      );

      // Cannot pause when already paused
      await mexas.pause();
      await expect(mexas.pause()).to.be.revertedWithCustomError(
        mexas,
        "EnforcedPause",
      );

      // Cannot unpause twice
      await mexas.unpause();
      await expect(mexas.unpause()).to.be.revertedWithCustomError(
        mexas,
        "ExpectedPause",
      );
    });
  });

  describe("Access Control", () => {
    it("Should restrict pause/unpause to owner", async () => {
      const { mexas, user1 } = await loadFixture(fixture);

      // Non-owner cannot pause
      await expect(mexas.connect(user1).pause()).to.be.revertedWithCustomError(
        mexas,
        "OwnableUnauthorizedAccount",
      );

      // Setup paused state
      await mexas.pause();

      // Non-owner cannot unpause
      await expect(mexas.connect(user1).unpause()).to.be.revertedWithCustomError(
        mexas,
        "OwnableUnauthorizedAccount",
      );
    });
  });

  describe("Paused State Behavior", () => {
    async function setupPausedState(
      mexas: MEXAS,
      from: SignerWithAddress,
      to: SignerWithAddress,
      amount: bigint,
    ) {
      // Setup initial state
      await mexas.transfer(from.getAddress(), amount);
      await mexas.approve(to.getAddress(), amount);
      await mexas.connect(from).approve(to.getAddress(), amount);

      // Pause the contract
      await mexas.pause();
    }

    it("Should block all value transfers while paused", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await setupPausedState(mexas, user1, user2, amount);

      // Test regular transfer
      await expect(
        mexas.transfer(await user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test transferFrom
      await expect(
        mexas.transferFrom(
          await user1.getAddress(),
          await user2.getAddress(),
          amount,
        ),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test transfer to zero address
      await expect(
        mexas.transfer(ethers.ZeroAddress, amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test transferFrom to zero address
      await expect(
        mexas.transferFrom(await user1.getAddress(), ethers.ZeroAddress, amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");
    });

    it("Should block all approval operations while paused", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.pause();

      // Test regular approve
      await expect(
        mexas.approve(await user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test approve to zero address
      await expect(
        mexas.approve(ethers.ZeroAddress, amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test permit
      const deadline = ethers.MaxUint256;
      const owner = await mexas.owner();
      await expect(
        mexas.permit(
          owner,
          await user1.getAddress(),
          amount,
          deadline,
          0,
          ethers.ZeroHash,
          ethers.ZeroHash,
        ),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");
    });

    it("Should preserve complete system state through pause cycle", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      // Setup complex initial state
      const initialSupply = await mexas.totalSupply();
      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.approve(await user2.getAddress(), amount);
      await mexas.connect(user1).approve(await user2.getAddress(), amount * 2n);

      // Store initial state
      const user1Balance = await mexas.balanceOf(await user1.getAddress());
      const user2Allowance = await mexas.allowance(
        await owner.getAddress(),
        await user2.getAddress(),
      );
      const user1Allowance = await mexas.allowance(
        await user1.getAddress(),
        await user2.getAddress(),
      );

      // Pause and unpause
      await mexas.pause();
      await mexas.unpause();

      // Verify complete state preservation
      expect(await mexas.totalSupply()).to.equal(initialSupply);
      expect(await mexas.balanceOf(await user1.getAddress())).to.equal(
        user1Balance,
      );
      expect(
        await mexas.allowance(await owner.getAddress(), await user2.getAddress()),
      ).to.equal(user2Allowance);
      expect(
        await mexas.allowance(await user1.getAddress(), await user2.getAddress()),
      ).to.equal(user1Allowance);

      // Verify operations resume normally
      await expect(mexas.transfer(await user2.getAddress(), amount)).to.not.be
        .reverted;
      await expect(mexas.approve(await user1.getAddress(), amount)).to.not.be
        .reverted;
    });

    it("Should validate pause state in all transfer scenarios", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.pause();

      // Test direct transfer while paused
      await expect(
        mexas.transfer(user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test mint while paused
      await expect(
        mexas.mint(user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");

      // Test burn while paused
      await expect(mexas.redeem(amount)).to.be.revertedWithCustomError(
        mexas,
        "EnforcedPause",
      );
    });
  });
});
