// test/08-upgrades.test.ts
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";
import { MockValidV2 } from "../typechain-types";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("MEXAS Token - Upgrade Functionality", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Upgrade Security", () => {
    it("Should restrict upgrades to owner", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const ValidV2 = await ethers.getContractFactory("MockValidV2");

      await expect(
        upgrades.upgradeProxy(
          await mexas.getAddress(),
          ValidV2.connect(user1),
          { unsafeAllow: ["missing-initializer-call"] },
        ),
      )
        .to.be.revertedWithCustomError(mexas, "OwnableUnauthorizedAccount")
        .withArgs(await user1.getAddress());
    });

    it("Should validate implementation address", async () => {
      const { mexas } = await loadFixture(fixture);

      await expect(
        mexas.upgradeToAndCall(ethers.ZeroAddress, "0x"),
      ).to.be.revertedWithCustomError(mexas, "ZeroAddress");
    });

    it("Should prevent invalid implementation patterns", async () => {
      const NoUUPS = await ethers.getContractFactory("MockNoUUPS");

      await expect(upgrades.validateImplementation(NoUUPS)).to.be.rejectedWith(
        "Contract `contracts/mock/MockNoUUPS.sol:MockNoUUPS` is not upgrade safe",
      );
    });
  });

  describe("Storage Safety", () => {
    it("Should enforce storage compatibility", async () => {
      const { mexas } = await loadFixture(fixture);
      const BadStorage = await ethers.getContractFactory("MockBadStorage");

      await expect(
        upgrades.validateUpgrade(await mexas.getAddress(), BadStorage),
      ).to.be.rejectedWith("New storage layout is incompatible");
    });

    it("Should preserve all state variables after upgrade", async () => {
      const { mexas, owner, user1, user2 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      // Setup complex state
      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.approve(await user2.getAddress(), amount);
      await mexas.addToBlockedList(await user2.getAddress());
      await mexas.pause();

      // Perform upgrade
      const ValidV2 = await ethers.getContractFactory("MockValidV2");
      // V2 must NOT re-run parent initializers (proxy was initialized in V1).
      // The flag below tells the OZ validator to allow that pattern.
      const mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );

      // Verify state preservation
      expect(await mexaV2.balanceOf(await user1.getAddress())).to.equal(amount);
      expect(
        await mexaV2.allowance(
          await owner.getAddress(),
          await user2.getAddress(),
        ),
      ).to.equal(amount);
      expect(await mexaV2.isBlocked(await user2.getAddress())).to.be.true;
      expect(await mexaV2.paused()).to.be.true;

      // Permit still works after upgrade
      // Unpause first (we paused pre-upgrade to test state preservation)
      await mexaV2.connect(owner).unpause();
      const deadline = ethers.MaxUint256;
      const ownerAddr = await owner.getAddress();
      const spenderAddr = await user1.getAddress();
      const signature = await owner.signTypedData(
        {
          name: await mexaV2.name(),
          version: "1",
          chainId: (await owner.provider!.getNetwork()).chainId,
          verifyingContract: await mexaV2.getAddress(),
        },
        {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        {
          owner: ownerAddr,
          spender: spenderAddr,
          value: 1n,
          nonce: await mexaV2.nonces(ownerAddr),
          deadline,
        },
      );
      const { v, r, s } = ethers.Signature.from(signature);
      await mexaV2.permit(ownerAddr, spenderAddr, 1n, deadline, v, r, s);
      expect(await mexaV2.allowance(ownerAddr, spenderAddr)).to.equal(1n);
    });

    it("Should maintain gap slots for future upgrades", async () => {
      const { mexas } = await loadFixture(fixture);
      const ValidV2 = await ethers.getContractFactory("MockValidV2");

      // A successful upgrade validates that proper gaps are maintained
      // Allow skipping parent initializer calls for V2
      const mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );

      // Additional validation that we can initialize V2
      await mexaV2.initializeV2();
      expect(await mexaV2.newFeature()).to.equal(42);
    });
  });

  describe("Domain separator stability", () => {
    it("Should keep EIP-712 domain separator unchanged across upgrade", async () => {
      const { mexas } = await loadFixture(fixture);
      // Capture domain for OZ ERC20Permit (name, version, chainId, verifyingContract)
      const name = await mexas.name();
      const chainId = (await mexas.runner!.provider!.getNetwork()).chainId.toString();
      const verifying = await mexas.getAddress();
      const before = JSON.stringify({ name, version: "1", chainId, verifying });

      // Upgrade
      const ValidV2 = await ethers.getContractFactory("MockValidV2");
      const mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );

      const name2 = await mexaV2.name();
      const chainId2 = (await mexaV2.runner!.provider!.getNetwork()).chainId.toString();
      const verifying2 = await mexaV2.getAddress();
      const after = JSON.stringify({ name: name2, version: "1", chainId: chainId2, verifying: verifying2 });

      // Since name and verifyingContract remain identical, domain separator remains stable
      expect(after).to.equal(before);
    });
  });

  describe("Initialization Protection", () => {
    it("Should prevent reinitialization", async () => {
      const { mexas } = await loadFixture(fixture);
      const ValidV2 = await ethers.getContractFactory("MockValidV2");
      const mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );

      await mexaV2.initializeV2();
      await expect(mexaV2.initializeV2()).to.be.revertedWithCustomError(
        mexaV2,
        "InvalidInitialization",
      );

      // Calling original initializer should revert on proxy
      // @ts-ignore-next-line - initialize might exist on impl but guarded on proxy
      await expect((mexaV2 as any).initialize()).to.be.reverted;
    });
  });

  describe("V2 Functionality", () => {
    let mexaV2: MockValidV2;

    beforeEach(async () => {
      const { mexas } = await loadFixture(fixture);
      const ValidV2 = await ethers.getContractFactory("MockValidV2");
      // Allow skipping parent initializer calls for V2
      mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );
      await mexaV2.initializeV2();
    });

    it("Should maintain core V1 features", async () => {
      const { user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      await expect(mexaV2.transfer(await user1.getAddress(), amount)).to.not.be
        .reverted;
      expect(await mexaV2.balanceOf(await user1.getAddress())).to.equal(amount);
    });

    it("Should preserve access control", async () => {
      const { user1, user2 } = await loadFixture(fixture);

      await expect(mexaV2.connect(user1).pause()).to.be.revertedWithCustomError(
        mexaV2,
        "OwnableUnauthorizedAccount",
      );

      await expect(
        mexaV2.connect(user1).addToBlockedList(await user2.getAddress()),
      ).to.be.revertedWithCustomError(mexaV2, "OwnableUnauthorizedAccount");
    });

    it("Should support new V2 features", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      const ValidV2 = await ethers.getContractFactory("MockValidV2");

      // Upgrade the proxy to the new implementation
      const mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );

      // Explicitly call the V2 initializer
      await mexaV2.initializeV2();

      // Check version has been updated
      expect(await mexaV2.version()).to.equal("2.0.0");

      // Test V2-specific functionality
      expect(await mexaV2.newFeature()).to.equal(42);

      // Test that V2 maintains blacklist functionality
      await mexaV2.addToBlockedList(await user1.getAddress());
      expect(await mexaV2.isBlocked(await user1.getAddress())).to.be.true;
    });
    it("Should preserve complex state variables across upgrades", async () => {
      const { mexas, user1, user2, owner } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);

      // Pre-upgrade complex state
      await mexas.transfer(await user1.getAddress(), amount);
      await mexas.approve(await user2.getAddress(), amount);
      await mexas.addToBlockedList(await user2.getAddress());
      await mexas.pause();

      // Upgrade the proxy
      const ValidV2 = await ethers.getContractFactory("MockValidV2");
      const mexaV2 = await upgrades.upgradeProxy(
        await mexas.getAddress(),
        ValidV2,
        { unsafeAllow: ["missing-initializer-call"] },
      );
      await mexaV2.initializeV2();

      // Validate complex state after upgrade
      expect(await mexaV2.balanceOf(await user1.getAddress())).to.equal(amount);
      expect(
        await mexaV2.allowance(owner.address, await user2.getAddress()),
      ).to.equal(amount);
      expect(await mexaV2.isBlocked(await user2.getAddress())).to.be.true;
      expect(await mexaV2.paused()).to.be.true;
    });
  });
  it("Should prevent unauthorized users from performing upgrades", async () => {
    const { mexas, user1 } = await loadFixture(fixture);
    const ValidV2 = await ethers.getContractFactory("MockValidV2");

    // Deploy the new implementation
    const newImplementation = await ValidV2.deploy();
    await newImplementation.waitForDeployment();

    // Recast the proxy contract to a generic ethers.Contract
    const proxyAsGeneric = new ethers.Contract(
      await mexas.getAddress(),
      [
        {
          inputs: [
            {
              internalType: "address",
              name: "newImplementation",
              type: "address",
            },
          ],
          name: "upgradeTo",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      user1, // Use the unauthorized user
    );

    // Attempt the unauthorized upgrade
    await expect(
      proxyAsGeneric.upgradeTo(await newImplementation.getAddress()),
    ).to.be.revertedWithoutReason();
  });
});
