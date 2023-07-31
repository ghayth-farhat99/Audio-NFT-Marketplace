const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();


  // Deploy NFTMarketplace contract
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();

  // Write NFTMarketplace contract address and ABI to a JSON file
  const marketplaceData = {
    address: marketplace.address,
    abi: JSON.parse(marketplace.interface.format('json'))
  }
  fs.writeFileSync('./src/Marketplace.json', JSON.stringify(marketplaceData))

  // Deploy NFT contract
  const NFT = await hre.ethers.getContractFactory("RentableNft");
  const nft = await NFT.deploy(marketplace.address);
  await nft.deployed();

  // Write NFT contract address and ABI to a JSON file
  const nftData = {
    address: nft.address,
    abi: JSON.parse(nft.interface.format('json'))
  }
  fs.writeFileSync('./src/NFT.json', JSON.stringify(nftData))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
