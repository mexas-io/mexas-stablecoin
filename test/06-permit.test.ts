// test/06-permit.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deploymentFixture } from "./helpers/fixtures";

async function getPermitSignature(
  signer: any,
  token: any,
  spender: string,
  value: bigint,
  deadline: bigint,
) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(signer.address),
    token.name(),
    "1",
    signer.provider.getNetwork().then((n: any) => n.chainId),
  ]);

  const domain = {
    name,
    version,
    chainId,
    verifyingContract: await token.getAddress(),
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    owner: await signer.getAddress(),
    spender,
    value,
    nonce,
    deadline,
  };

  const signature = await signer.signTypedData(domain, types, message);
  return ethers.Signature.from(signature);
}

describe("MEXAS Token - Permit Functionality", function () {
  async function fixture() {
    return await deploymentFixture();
  }

  describe("Basic Operations", () => {
    it("Should approve via permit with valid signature", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const deadline = ethers.MaxUint256;

      const ownerAddr = await owner.getAddress();
      const spenderAddr = await user1.getAddress();

      const { v, r, s } = await getPermitSignature(
        owner,
        mexas,
        spenderAddr,
        amount,
        deadline,
      );

      await mexas.permit(ownerAddr, spenderAddr, amount, deadline, v, r, s);

      expect(await mexas.allowance(ownerAddr, spenderAddr)).to.equal(amount);
      expect(await mexas.nonces(ownerAddr)).to.equal(1);
    });
  });

  describe("Security", () => {
    it("Should reject expired permit", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const deadline = 0n; // Expired deadline

      const ownerAddr = await owner.getAddress();
      const spenderAddr = await user1.getAddress();

      const { v, r, s } = await getPermitSignature(
        owner,
        mexas,
        spenderAddr,
        amount,
        deadline,
      );

      await expect(
        mexas.permit(ownerAddr, spenderAddr, amount, deadline, v, r, s),
      ).to.be.revertedWithCustomError(mexas, "ERC2612ExpiredSignature");
    });

    it("Should prevent reuse of signature", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const deadline = ethers.MaxUint256;

      const ownerAddr = await owner.getAddress();
      const spenderAddr = await user1.getAddress();

      const { v, r, s } = await getPermitSignature(
        owner,
        mexas,
        spenderAddr,
        amount,
        deadline,
      );

      // First permit should succeed
      await mexas.permit(ownerAddr, spenderAddr, amount, deadline, v, r, s);

      // Second attempt with same signature should fail
      await expect(
        mexas.permit(ownerAddr, spenderAddr, amount, deadline, v, r, s),
      ).to.be.revertedWithCustomError(mexas, "ERC2612InvalidSigner");
    });

    it("Should prevent permit for blacklisted spender", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const deadline = ethers.MaxUint256;

      // Blacklist user1
      await mexas.addToBlockedList(await user1.getAddress());

      const { v, r, s } = await getPermitSignature(
        owner,
        mexas,
        await user1.getAddress(),
        amount,
        deadline,
      );

      await expect(
        mexas.permit(
          await owner.getAddress(),
          await user1.getAddress(),
          amount,
          deadline,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should prevent permit for blacklisted owner", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const deadline = ethers.MaxUint256;

      // Blacklist owner
      await mexas.addToBlockedList(await owner.getAddress());

      const { v, r, s } = await getPermitSignature(
        owner,
        mexas,
        await user1.getAddress(),
        amount,
        deadline,
      );

      await expect(
        mexas.permit(
          await owner.getAddress(),
          await user1.getAddress(),
          amount,
          deadline,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(mexas, "BlacklistedAddress");
    });

    it("Should prevent permit when paused", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1000", 6);
      const deadline = ethers.MaxUint256;

      await mexas.pause();

      const { v, r, s } = await getPermitSignature(
        owner,
        mexas,
        await user1.getAddress(),
        amount,
        deadline,
      );

      await expect(
        mexas.permit(
          await owner.getAddress(),
          await user1.getAddress(),
          amount,
          deadline,
          v,
          r,
          s,
        ),
      ).to.be.revertedWithCustomError(mexas, "EnforcedPause");
    });

    it("Should reject permit with invalid signer", async () => {
      const { mexas, owner, user1 } = await loadFixture(fixture);
      const amount = ethers.parseUnits("1", 6);
      const deadline = ethers.MaxUint256;

      const name = await mexas.name();
      const chainId = (await owner.provider!.getNetwork()).chainId;
      const verifyingContract = await mexas.getAddress();
      const wrongOwner = await user1.getAddress();
      const spender = await user1.getAddress();
      const nonce = await mexas.nonces(wrongOwner);

      const domain = { name, version: "1", chainId, verifyingContract } as const;
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      } as const;
      const message = { owner: wrongOwner, spender, value: amount, nonce, deadline } as const;

      const signature = await user1.signTypedData(domain, types as any, message as any);
      const { v, r, s } = ethers.Signature.from(signature);

      await expect(
        mexas.permit(await owner.getAddress(), spender, amount, deadline, v, r, s),
      ).to.be.revertedWithCustomError(mexas, "ERC2612InvalidSigner");
    });
  });
});
