import type { HardhatUserConfig } from "hardhat/config";
import path from "node:path";

import dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache-hardhat",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL?.trim() || "",
      accounts: deployerKey ? [deployerKey] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
