import { INFT } from '@/interfaces/NFT.interface';
import { ethers } from 'ethers';
import config from '@/config';
import fetch from 'node-fetch';

async function getNFTs(address: string): Promise<INFT[]> {
  const res = await fetch(`${config.syncServerURL}/webaverse-erc721/?owner=${address}`).then(res => res.json());
  return res as INFT[];
}

async function getNFT(id: string): Promise<INFT> {
  const res = await fetch(`${config.syncServerURL}/webaverse-erc721/${id}`).then(res => res.json());
  if (!res || !res.id) {
    return null;
  }
  return res as INFT;
}

async function getNFTOwner(id: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc721.address, config.erc721.abi, provider);
  const owner = await contract.ownerOf(id);
  return owner.toLowerCase();
}

async function transfer(mnemonic: string, toAddress: string, id: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.erc721.address, config.erc721.abi, wallet);

  const fromAddress = await wallet.getAddress();
  const tx = await contract.transferFrom(fromAddress, toAddress, id, {
    gasLimit: 1000000,
  });
  await tx.wait();
  return tx.hash;
}

async function getMintFee(): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.webaverse.address, config.webaverse.abi, provider);
  const fee = await contract.mintFee();
  const feeInEther = ethers.utils.formatEther(fee);
  return feeInEther;
}

async function mint(mnemonic: string, hash: string, name: string, ext: string, description: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.webaverse.address, config.webaverse.abi, wallet);

  const userAddress = await wallet.getAddress();
  const tx = await contract.mint(userAddress, hash, name, ext, description, { gasLimit: 3000000 });
  await tx.wait();
  return tx.hash;
}

async function getMetadata(tokenId: string, key: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc721.address, config.erc721.abi, provider);
  const hash = await contract.getHashFromTokenId(tokenId);
  const metadata = await contract.getMetadata(hash, key);
  return metadata;
}

async function setMetadata(mnemonic: string, tokenId: string, key: string, value: string): Promise<void> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

  const contractERC = new ethers.Contract(config.erc721.address, config.erc721.abi, wallet);
  const contractWebaverse = new ethers.Contract(config.webaverse.address, config.webaverse.abi, wallet);

  const hash = await contractERC.getHashFromTokenId(tokenId);
  const tx = await contractWebaverse.setMetadata(hash, key, value, {
    gasLimit: 1000000,
  });
  await tx.wait();
}

async function getTokenIdFromHash(hash: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc721.address, config.erc721.abi, provider);
  const tokenId = await contract.getTokenIdFromHash(hash);
  return `${tokenId}`;
}

export default {
  getNFTs,
  getNFT,
  getNFTOwner,
  transfer,
  getMintFee,
  mint,
  getMetadata,
  setMetadata,
  getTokenIdFromHash,
};
