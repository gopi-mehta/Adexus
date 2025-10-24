import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy CampaignRegistry
  console.log("\nDeploying CampaignRegistry...");
  const CampaignRegistry = await ethers.getContractFactory("CampaignRegistry");
  const campaignRegistry = await CampaignRegistry.deploy();
  await campaignRegistry.waitForDeployment();

  const registryAddress = await campaignRegistry.getAddress();
  console.log("✅ CampaignRegistry deployed to:", registryAddress);

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("\n📝 Deployment Summary:");
  console.log("========================");
  console.log("Network:", network.name);
  console.log("Chain ID:", chainId);
  console.log("CampaignRegistry:", registryAddress);
  console.log("Deployer:", deployer.address);
  console.log("========================\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: chainId,
    contracts: {
      CampaignRegistry: registryAddress,
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `deployment-${chainId}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${filepath}`);

  // Save ABI
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "CampaignRegistry.sol",
    "CampaignRegistry.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const abiDir = path.join(__dirname, "..", "app", "lib", "contracts");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(abiDir, "CampaignRegistry.json"),
    JSON.stringify({ abi: artifact.abi, address: registryAddress }, null, 2)
  );
  console.log("✅ ABI saved to app/lib/contracts/");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📌 Next steps:");
  console.log("1. Verify the contract on Basescan:");
  console.log(
    `   npx hardhat verify --network ${
      network.name === "base-sepolia" ? "baseSepolia" : "base"
    } ${registryAddress}`
  );
  console.log("\n2. Update your .env.local with the contract address");
  console.log("\n3. Fund your first campaign to test!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
