import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("RroyalP2PEscrow", function () {
  const USDT_UNIT = 10n ** 6n;

  async function deployFixture() {
    const [admin, seller, buyer, stranger] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockUSDT");
    const usdt = await Mock.deploy();
    await usdt.waitForDeployment();
    const Escrow = await ethers.getContractFactory("RroyalP2PEscrow");
    const escrow = await Escrow.deploy(await usdt.getAddress(), admin.address);
    await escrow.waitForDeployment();
    return { admin, seller, buyer, stranger, usdt, escrow };
  }

  it("createLockedTrade → releaseUSDT (happy path)", async function () {
    const { seller, buyer, usdt, escrow } = await deployFixture();
    const amount = 1_000n * USDT_UNIT;
    await usdt.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).createLockedTrade(amount, buyer.address, 2680n, 1);
    const orderId = 1n;
    const before = await usdt.balanceOf(buyer.address);
    await escrow.connect(seller).releaseUSDT(orderId);
    const after = await usdt.balanceOf(buyer.address);
    expect(after - before).to.equal(amount);
    expect((await escrow.trades(orderId)).status).to.equal(3n);
  });

  it("reverts when tier-1 seller exceeds 500 USDT", async function () {
    const { seller, buyer, usdt, escrow } = await deployFixture();
    const amount = 501n * USDT_UNIT;
    await usdt.connect(seller).approve(await escrow.getAddress(), amount);
    await expect(
      escrow.connect(seller).createLockedTrade(amount, buyer.address, 1n, 0)
    ).to.be.revertedWithCustomError(escrow, "TierLimitExceeded");
  });

  it("admin upgrades tier then larger trade succeeds", async function () {
    const { admin, seller, buyer, usdt, escrow } = await deployFixture();
    await escrow.connect(admin).setUserTier(seller.address, 2);
    const amount = 2_000n * USDT_UNIT;
    await usdt.connect(seller).approve(await escrow.getAddress(), amount);
    await expect(
      escrow.connect(seller).createLockedTrade(amount, buyer.address, 1n, 0)
    ).to.not.be.reverted;
  });

  it("cancelTrade refunds seller after 15 minutes (callable by anyone)", async function () {
    const { seller, buyer, stranger, usdt, escrow } = await deployFixture();
    const amount = 100n * USDT_UNIT;
    await usdt.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).createLockedTrade(amount, buyer.address, 1n, 0);
    const orderId = 1n;
    await time.increase(15 * 60 + 1);
    const before = await usdt.balanceOf(seller.address);
    await escrow.connect(stranger).cancelTrade(orderId);
    const after = await usdt.balanceOf(seller.address);
    expect(after - before).to.equal(amount);
    expect((await escrow.trades(orderId)).status).to.equal(5n);
  });

  it("openDispute then admin resolveDispute pays buyer", async function () {
    const { admin, seller, buyer, usdt, escrow } = await deployFixture();
    const amount = 200n * USDT_UNIT;
    await usdt.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).createLockedTrade(amount, buyer.address, 1n, 0);
    const orderId = 1n;
    await escrow.connect(buyer).openDispute(orderId);
    const before = await usdt.balanceOf(buyer.address);
    await escrow.connect(admin).resolveDispute(orderId, true);
    expect((await usdt.balanceOf(buyer.address)) - before).to.equal(amount);
  });

  it("createTrade + lockUSDT two-step flow", async function () {
    const { seller, buyer, usdt, escrow } = await deployFixture();
    const amount = 300n * USDT_UNIT;
    await escrow.connect(seller).createTrade(buyer.address, amount, 100n, 0);
    const orderId = 1n;
    expect((await escrow.trades(orderId)).status).to.equal(1n);
    await usdt.connect(seller).approve(await escrow.getAddress(), amount);
    await escrow.connect(seller).lockUSDT(orderId);
    expect((await escrow.trades(orderId)).status).to.equal(2n);
  });
});
