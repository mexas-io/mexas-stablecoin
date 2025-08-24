// test/03-blacklist.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";

describe("MEXAS Token - Blacklist", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Blacklist Management", () => {

    it("Should prevent blacklisting already blacklisted address", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const userAddr = await user1.getAddress();

      await mexas.addToBlockedList(userAddr);
      await expect(
        mexas.addToBlockedList(userAddr),
      ).to.be.revertedWithCustomError(mexas, "AlreadyBlacklisted");
    });

    it("Should prevent unblacklisting address that isn't blacklisted", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const userAddr = await user1.getAddress();

      await expect(
        mexas.removeFromBlockedList(userAddr),
      ).to.be.revertedWithCustomError(mexas, "NotBlacklisted");
    });

    it("Should emit BlockPlaced event when adding to blacklist", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const userAddr = await user1.getAddress();

      await expect(mexas.addToBlockedList(userAddr))
        .to.emit(mexas, "BlockPlaced")
        .withArgs(userAddr);
    });

    it("Should emit BlockReleased event when removing from blacklist", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const userAddr = await user1.getAddress();

      await mexas.addToBlockedList(userAddr);
      await expect(mexas.removeFromBlockedList(userAddr))
        .to.emit(mexas, "BlockReleased")
        .withArgs(userAddr);
    });
  });

  describe("Blacklist Transfer Restrictions", () => {
    it("Should prevent transfers from blacklisted sender", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.addToBlockedList(await user1.getAddress());

      await expect(
        mexas.connect(user1).transfer(await user2.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    // it("Should prevent transfers to blacklisted recipient", async () => {
    //   const { mexas, owner, user1 } = await loadFixture(fixture);
    //   const amount = ethers.parseUnits("1000", 6);

    //   await mexas.addToBlockedList(await user1.getAddress());
    //   await expect(
    //     mexas.transfer(await user1.getAddress(), amount),
    //   ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    // });

    it("Should allow transfers to a blacklisted address", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.addToBlockedList(await user1.getAddress());
      await expect(mexas.transfer(await user1.getAddress(), amount)).to.emit(
        mexas,
        "Transfer",
      );
    });

    it("Should prevent transferFrom when sender is blacklisted", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.connect(user1).approve(await user2.getAddress(), amount);
      await mexas.addToBlockedList(await user1.getAddress());

      await expect(
        mexas
          .connect(user2)
          .transferFrom(
            await user1.getAddress(),
            await user2.getAddress(),
            amount,
          ),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    //   it("Should prevent transferFrom when recipient is blacklisted", async () => {
    //     const { mexas, owner, user1, user2 } = await loadFixture(fixture);
    //     const amount = ethers.parseUnits("1000", 6);

    //     await mexas.transfer(await user1.getAddress(), amount);
    //     await mexas.connect(user1).approve(await user2.getAddress(), amount);
    //     await mexas.addToBlockedList(await user2.getAddress());

    //     await expect(
    //       mexas
    //         .connect(user2)
    //         .transferFrom(
    //           await user1.getAddress(),
    //           await user2.getAddress(),
    //           amount,
    //         ),
    //     ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    //   });
    // });

    it("Should prevent a transferFrom to be executed by a blacklisted address", async () => {
      const { mexas, owner, user1, user2, user3 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.connect(user1).approve(await user2.getAddress(), amount);
      await mexas.addToBlockedList(await user2.getAddress());

      await expect(
        mexas
          .connect(user2)
          .transferFrom(
            await user1.getAddress(),
            await user3.getAddress(),
            amount,
          ),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should allow transferFrom to a blacklisted address", async () => {
      const { mexas, owner, user1, user2, user3 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.connect(user1).approve(await user2.getAddress(), amount);
      await mexas.addToBlockedList(await user3.getAddress());

      await expect(
        mexas
          .connect(user2)
          .transferFrom(
            await user1.getAddress(),
            await user3.getAddress(),
            amount,
          ),
      ).to.emit(mexas, "Transfer");
    });
  });

  describe("Blacklist Operation Restrictions", () => {
    it("Should prevent minting to blacklisted address", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.addToBlockedList(await user1.getAddress());
      await expect(
        mexas.mint(await user1.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should prevent approvals when owner is blacklisted", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.addToBlockedList(await user1.getAddress());
      await expect(
        mexas.connect(user1).approve(await user2.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should prevent approvals when spender is blacklisted", async () => {
      const { mexas, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await mexas.addToBlockedList(await user2.getAddress());
      await expect(
        mexas.connect(user1).approve(await user2.getAddress(), amount),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });
  });
});
