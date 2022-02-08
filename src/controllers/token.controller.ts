import { Message, MessageEmbed } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import FTService from '@/services/FT.service';
import { utils } from 'ethers';
import userService from '@/services/user.service';
import nftService from '@/services/nft.service';
import config from '@/config';

async function getTokenMetadata(message: Message): Promise<void> {
  const words = message.content.split(' ');
  const tokenId = words[1];
  if (!tokenId) {
    message.reply('Please provide a token ID');
    return;
  }
  const nft = await nftService.getNFT(tokenId);

  if (!nft) {
    message.reply('Token not found');
    return;
  }

  const embed = new MessageEmbed()
    .setColor('#000000')
    .setTitle(`Token ID: ${nft.token_id} | Name: ${nft.metadata.name || 'null'}`)
    .setDescription(`${nft.metadata.description || 'No description.'}`)
    .setThumbnail(nft.metadata.image)
    .setURL(nft.metadata.external_url)
    .addFields(
      nft.metadata.attributes.map(attribute => ({ name: attribute.trait_type, value: attribute.value, inline: true })),
    );
  message.channel.send(embed);
}

async function getTokenMetadataAndDM(message: Message): Promise<void> {
  const words = message.content.split(' ');
  const tokenId = words[1];
  if (!tokenId) {
    message.reply('Please provide a token ID');
    return;
  }
  const nft = await nftService.getNFT(tokenId);
  if (!nft) {
    message.reply('Token not found');
    return;
  }
  const embed = new MessageEmbed()
    .setColor('#000000')
    .setTitle(`Token ID: ${nft.token_id} | Name: ${nft.metadata.name || 'null'}`)
    .setDescription(`${nft.metadata.description || 'No description.'}`)
    .setThumbnail(nft.metadata.image)
    .setURL(nft.metadata.external_url)
    .addFields(
      nft.metadata.attributes.map(attribute => ({ name: attribute.trait_type, value: attribute.value, inline: true })),
    );
  try {
    await message.author.send(embed);
  } catch (error) {
    if (error.message === 'Cannot send messages to this user') {
      message.reply('Could not DM you. Please enable DMs from this server.');
      return;
    }
  }
}

async function sendSILK(message: Message, user: IUser): Promise<string> {
  const words = message.content.split(' ');

  if (words.length < 3) {
    message.channel.send('Please provide a valid recipient and amount');
    message.channel.send(`USAGE: ${config.botPrefix}send [@user|0xaddr] [amount]`);
  }
  let address = words[1];

  if (words[1].startsWith('<@!') && words[1].endsWith('>')) {
    const cmdUser = await userService.getUser(words[1].toLowerCase().replace('<@!', '').replace('>', ''));
    if (!cmdUser) {
      message.channel.send('User not found');
      return;
    }
    address = cmdUser.wallet.address;
  }

  if (!utils.isAddress(address)) {
    message.channel.send('Invalid address');
    return;
  }

  const amount = words[2];
  if (!amount || isNaN(Number(amount))) {
    message.reply('Please provide a valid amount');
    return;
  }

  const amountBN = utils.parseEther(amount);
  const balance = await FTService.getBalance(user.wallet.address);
  const balanceBN = utils.parseEther(balance);
  if (amountBN.gt(balanceBN)) {
    message.reply('You do not have enough SILK');
    return;
  }
  const txHash = await FTService.transfer(user.wallet.mnemonic, address, amountBN);
  await message.channel.send(`Sent ${amount} SILK to ${address}`);
  await message.channel.send(`Transaction: ${txHash}`);
}

async function transferNFT(message: Message, user: IUser): Promise<string> {
  const words = message.content.split(' ');

  if (words.length < 3) {
    await message.reply('Please provide a valid recipient and amount');
    return;
  }
  let address = words[1];
  let balance = words[2];

  if (words[1].startsWith('<@!') && words[1].endsWith('>')) {
    const cmdUser = await userService.getUser(words[1].toLowerCase().replace('<@!', '').replace('>', ''));
    if (!cmdUser) {
      message.channel.send('User not found');
      return;
    }
    address = cmdUser.wallet.address;
  }

  if (!utils.isAddress(address)) {
    message.channel.send('Invalid address');
    return;
  }

  const tokenID = words[2];
  if (!tokenID || isNaN(Number(tokenID))) {
    message.reply('Please provide a valid token id');
    return;
  }
  if (!balance || isNaN(Number(balance))) {
    balance = '1';
    return;
  }

  let ownedBalance = '';
  try {
    ownedBalance = await nftService.getNFTBalance(user.address, tokenID);
  } catch (error) {
    message.reply(`You do not own ${balance} NFTs of this token id`);
    return;
  }
  console.log('ownedBalance: ', ownedBalance);
  if (ownedBalance === '0') {
    message.reply(`You do not own ${balance} NFTs of this token id`);
    return;
  }
  const txHash = await nftService.transfer(user.wallet.mnemonic, address, tokenID, '1');
  await message.channel.send(`Sent token #${tokenID} to ${address}`);
  await message.channel.send(`Transaction: ${txHash}`);
}

async function getNFTMetadata(message: Message): Promise<void> {
  // const words = message.content.split(' ');
  // const tokenId = words[1];
  // const key = words[2];
  // if (!tokenId || !key) {
  //   message.reply('Please provide token ID and key');
  //   return;
  // }
  // const metadataValue = await nftService.getMetadata(tokenId, key);
  // await message.reply(`${key}: ${metadataValue}`);
}

async function setNFTMetadata(message: Message, user: IUser): Promise<void> {
  // const words = message.content.split(' ');
  // const tokenId = words[1];
  // const key = words[2];
  // const value = words[3];
  // if (!tokenId || !key || !value) {
  //   message.reply('Please provide token ID, key and value');
  //   return;
  // }

  // let ownedBalance = '';
  // try {
  //   ownedBalance = await nftService.getNFTBalance(user.address, tokenId);
  // } catch (error) {
  //   message.reply(`You do not completely own this NFT`);
  //   return;
  // }
  // console.log('ownedBalance: ', ownedBalance);

  // await nftService.setMetadata(user.wallet.mnemonic, tokenId, key, value);
}

export default {
  getTokenMetadata,
  getTokenMetadataAndDM,
  sendSILK,
  transferNFT,
  getNFTMetadata,
  setNFTMetadata,
};
