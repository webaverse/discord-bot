import { ethers, BigNumber } from 'ethers';
import config from '@/config';

async function getBalance(address: string): Promise<string> {
  // call getBalance on the contract
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc20.address, config.erc20.abi, provider);
  const balance = await contract.balanceOf(address);
  const balanceInEther = ethers.utils.formatEther(balance);
  return balanceInEther;
}

async function transfer(mnemonic: string, toAddress: string, amount: BigNumber): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

  const contract = new ethers.Contract(config.erc20.address, config.erc20.abi, wallet);
  const tx = await contract.transfer(toAddress, amount);
  return tx.hash;
}

async function approve(mnemonic: string, address: string, amount: BigNumber): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

  const contract = new ethers.Contract(config.erc20.address, config.erc20.abi, wallet);
  const tx = await contract.approve(address, amount);
  return tx.hash;
}

export default {
  getBalance,
  transfer,
  approve,
};
