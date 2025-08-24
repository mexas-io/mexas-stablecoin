// test/01-initialization.test.ts
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";

describe("MEXAS Token - Initialization", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Basic Initialization", () => {
    it("Should return correct version string", async () => {
      const { mexas } = await loadFixture(fixture);
      expect(await mexas.version()).to.equal("1.0.0");
    });

    it("Should initialize with correct initial supply", async () => {
      const { mexas, owner, INITIAL_SUPPLY } = await loadFixture(fixture);
      expect(await mexas.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await mexas.balanceOf(await owner.getAddress())).to.equal(
        INITIAL_SUPPLY,
      );
    });

    it("Should set correct token metadata", async () => {
      const { mexas } = await loadFixture(fixture);
      expect(await mexas.name()).to.equal("MEXAS Stablecoin");
      expect(await mexas.symbol()).to.equal("MEX");
      expect(await mexas.decimals()).to.equal(6);
    });

    it("Should deploy implementation and allow pure version() (constructor path)", async () => {
      const Impl = await ethers.getContractFactory("MEXAS");
      const impl = await Impl.deploy();
      await impl.waitForDeployment();
      expect(await impl.version()).to.equal("1.0.0");
    });

    it("Should assign initial owner correctly", async () => {
      const { mexas, owner } = await loadFixture(fixture);
      expect(await mexas.owner()).to.equal(await owner.getAddress());
    });
  });

  describe("Initialization Validations", () => {
    it ("Should allow for an initial supply of 0", async () => {
      const fixt = await deploymentFixture("0");
      expect(await fixt.mexas.totalSupply()).to.equal(fixt.INITIAL_SUPPLY);
    });

    it("Should prevent zero address owner initialization", async () => {
      const MEXAS = await ethers.getContractFactory("MEXAS");
      const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6);

      await expect(
        upgrades.deployProxy(MEXAS, ["MEXAS Stablecoin", "MEX", INITIAL_SUPPLY, ethers.ZeroAddress], {
          initializer: "initialize",
        }),
      ).to.be.revertedWithCustomError(MEXAS, "OwnableInvalidOwner");
    });

    it("Should prevent reinitialization", async () => {
      const { mexas, owner } = await loadFixture(fixture);
      const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6);

      await expect(
        mexas.initialize("MEXAS Stablecoin", "MEX", INITIAL_SUPPLY, await owner.getAddress()),
      ).to.be.revertedWithCustomError(mexas, "InvalidInitialization");
    });
  });

  describe("Initial State", () => {
    it("Should start in unpaused state", async () => {
      const { mexas } = await loadFixture(fixture);
      expect(await mexas.paused()).to.be.false;
    });

    it("Should start with empty blacklist", async () => {
      const { mexas, user1 } = await loadFixture(fixture);
      expect(await mexas.isBlocked(await user1.getAddress())).to.be.false;
    });
  });
});
