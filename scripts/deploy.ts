import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT:", usdtAddress);

  const Escrow = await ethers.getContractFactory("RroyalP2PEscrow");
  const escrow = await Escrow.deploy(usdtAddress, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("RroyalP2PEscrow:", escrowAddress);

  console.log("\nAdd to your app / .env when testing on this network:");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_MOCK_USDT_ADDRESS=${usdtAddress}`);
  console.log("\nAdmin (deployer) can setUserTier(addr, 1|2|3) on the escrow for tiered limits.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
