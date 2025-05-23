import Web3 from "web3";

export const getWeb3 = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new Web3(window.ethereum);
  }
  throw new Error("No Ethereum provider found. Please install MetaMask.");
};

export const getContract = (contractAddress, contractABI) => {
  const web3 = getWeb3();
  return new web3.eth.Contract(contractABI, contractAddress);
};