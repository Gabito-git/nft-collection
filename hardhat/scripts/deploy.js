// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

require('dotenv').config();

// const METADATA_URL = process.env.METADATA_URL;
const WHITELIST_CONTRACT_ADDRESS = process.env.WHITELIST_CONTRACT_ADDRESS;

async function main() {

  const CryptoDevs = await hre.ethers.getContractFactory("CryptoDevs");
  const cryptoDevs = await CryptoDevs.deploy(
    "",
    WHITELIST_CONTRACT_ADDRESS
  );

  await cryptoDevs.deployed();

  console.log(
    `CryptoDevs  deployed to ${cryptoDevs.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
