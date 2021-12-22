import { INFT } from '@/interfaces/NFT.interface';
import { ethers } from 'ethers';
import config from '@/config';
import fetch from 'node-fetch';

async function getNFTs(address: string): Promise<INFT[]> {
  const res = await fetch(`${config.syncServerURL}/erc721?owner=${address}&network=sidechain`).then(res => res.json());
  return res as INFT[];
}

async function getNFT(id: string): Promise<INFT> {
  const res = await fetch(`${config.syncServerURL}/erc721/${id}?network=sidechain`).then(res => res.json());
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
  const tx = await contract.transferFrom(fromAddress, toAddress, id);
  return tx.hash;
}

async function getMintFee(): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.webaverse.address, config.webaverse.abi, provider);
  const fee = await contract.mintFee();
  const feeInEther = ethers.utils.formatEther(fee);
  return feeInEther;
}

async function mint(mnemonic: string, metadataURI: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.webaverse.address, config.webaverse.abi, wallet);

  const userAddress = await wallet.getAddress();
  const tx = await contract.mint(userAddress, metadataURI, { gasLimit: 3000000 });
  return tx.hash;
}

export default { getNFTs, getNFT, getNFTOwner, transfer, getMintFee, mint };
