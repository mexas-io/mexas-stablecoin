// test/helpers/fixtures.ts
import { ethers, upgrades } from "hardhat";
import { MEXAS } from "../../typechain-types";

export async function deploymentFixture(initial_supply?: string, name?: string, symbol?: string) {
  const [owner, user1, user2, user3] = await ethers.getSigners();
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const INITIAL_SUPPLY = ethers.parseUnits(initial_supply ? initial_supply.toString() : "1000000", 6); // 1M tokens

  const tokenName = name || "MEXAS Stablecoin";
  const tokenSymbol = symbol || "MEX";

  const MEXAS = await ethers.getContractFactory("MEXAS");
  const mexas = await upgrades.deployProxy(
    MEXAS,
    [tokenName, tokenSymbol, INITIAL_SUPPLY, await owner.getAddress()],
    { initializer: "initialize" },
  ) as MEXAS;

  await mexas.waitForDeployment();

  return {
    mexas,
    owner,
    user1,
    user2,
    user3,
    ZERO_ADDRESS,
    INITIAL_SUPPLY
  };
}
