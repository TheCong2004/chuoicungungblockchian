import { contractAddress, contractABI } from "../constants/config.js";
// eslint-disable-next-line no-unused-vars
import { getWeb3, getContract } from "./web3Service.js";

export const createProduct = async (account, name, origin, productionMethod, certification) => {
  try {
    const contract = getContract(contractAddress, contractABI);
    const result = await contract.methods
      .createProduct(name, origin, productionMethod, certification)
      .send({ from: account });
    return { tokenId: result.events.ProductCreated.returnValues.tokenId };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const addSupplyChainStep = async (account, tokenId, step) => {
  try {
    const contract = getContract(contractAddress, contractABI);
    await contract.methods.addSupplyChainStep(tokenId, step).send({ from: account });
    return true;
  } catch (error) {
    console.error("Error adding supply chain step:", error);
    throw error;
  }
};

export const getProduct = async (tokenId) => {
  try {
    const contract = getContract(contractAddress, contractABI);
    const product = await contract.methods.getProduct(tokenId).call();
    return {
      name: product[0],
      origin: product[1],
      productionMethod: product[2],
      certification: product[3],
      supplyChainSteps: product[4],
      producer: product[5],
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    const contract = getContract(contractAddress, contractABI);
    const productCounter = await contract.methods.productCounter().call();
    const products = [];

    for (let i = 1; i <= productCounter; i++) {
      try {
        const product = await getProduct(i);
        products.push({ tokenId: i, ...product });
      } catch (err) {
        console.warn(`Product with tokenId ${i} not found`);
      }
    }

    return products;
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error;
  }


};

// contractService.js

export const getImageByTokenId = async (tokenId) => {
  // Gia su ban dang su dung IPFS va tokenId la CID
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${tokenId}`;
    return url;
  } catch (error) {
    console.error("Loi khi lay hinh anh tu tokenId:", error);
    return null;
  }
};
