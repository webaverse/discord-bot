import { INFT } from '@/interfaces/NFT.interface';
import { BigNumber, ethers } from 'ethers';
import config from '@/config';
import fetch from 'node-fetch';

async function getNFTs(address: string): Promise<INFT[]> {
  const res = await fetch(`${config.syncServerURL}/nft/?owner=${address}&chainName=sidechain`).then(res => res.json());
  return res as INFT[];
}

async function getNFT(id: string): Promise<INFT> {
  const res = await fetch(`${config.syncServerURL}/nft/${config.erc1155.address}/${id}?chainName=sidechain`).then(res =>
    res.json(),
  );
  if (!res || !res.token_id) {
    return null;
  }
  return res as INFT;
}

async function getNFTBalance(address: string, id: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc1155.address, config.erc1155.abi, provider);
  const balance = (await contract.balanceOf(address, id)) as BigNumber;
  return balance.toString();
}

async function transfer(mnemonic: string, toAddress: string, id: string, balance: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.erc1155.address, config.erc1155.abi, wallet);
  const tx = await contract.safeTransfer(toAddress, id, balance, [], {
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

async function mint(mnemonic: string, cid: string, ext: string, balance: number): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.webaverse.address, config.webaverse.abi, wallet);

  const userAddress = await wallet.getAddress();

  const uri = `${cid}.${ext}`;

  const tx = await contract.mint(userAddress, balance, uri, [], { gasLimit: 3000000 });
  await tx.wait();
  return tx.hash;
}

async function getMetadata(tokenId: string, key: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc1155.address, config.erc1155.abi, provider);
  const hash = await contract.getHashFromTokenId(tokenId);
  const metadata = await contract.getMetadata(hash, key);
  return metadata;
}

async function setMetadata(mnemonic: string, tokenId: string, key: string, value: string): Promise<void> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

  const contractERC = new ethers.Contract(config.erc1155.address, config.erc1155.abi, wallet);
  const contractWebaverse = new ethers.Contract(config.webaverse.address, config.webaverse.abi, wallet);

  const hash = await contractERC.getHashFromTokenId(tokenId);
  const tx = await contractWebaverse.setMetadata(hash, key, value, {
    gasLimit: 1000000,
  });
  await tx.wait();
}

async function getTokenIdFromHash(hash: string): Promise<string> {
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const contract = new ethers.Contract(config.erc1155.address, config.erc1155.abi, provider);
  const tokenId = await contract.getTokenIdFromHash(hash);
  return `${tokenId}`;
}

export default {
  getNFTs,
  getNFT,
  getNFTBalance,
  transfer,
  getMintFee,
  mint,
  getMetadata,
  setMetadata,
  getTokenIdFromHash,
};
