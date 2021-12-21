import { Message, MessageEmbed } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import FTService from '@/services/FT.service';
import { utils } from 'ethers';
import userService from '@/services/user.service';
import nftService from '@/services/nft.service';

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
    .setTitle(`${nft.tokenID} - ${nft.name}`)
    .setDescription(`${nft.description || 'No description.'}`)
    .setThumbnail(nft.image)
    .setURL(nft.external_url)
    .addFields(nft.attributes.map(attribute => ({ name: attribute.trait_type, value: attribute.trait_type })));
  message.channel.send({ embeds: [embed] });
}

async function getTokenMetadataAndDM(message: Message): Promise<void> {
  const words = message.content.split(' ');
  const tokenId = words[1];
  if (!tokenId) {
    message.reply('Please provide a token ID');
    return;
  }
  const nft = await nftService.getNFT(tokenId);

  const embed = new MessageEmbed()
    .setColor('#000000')
    .setTitle(`${nft.tokenID} - ${nft.name}`)
    .setDescription(`${nft.description || 'No description.'}`)
    .setThumbnail(nft.image)
    .setURL(nft.external_url)
    .addFields(nft.attributes.map(attribute => ({ name: attribute.trait_type, value: attribute.trait_type })));
  message.author.send({ embeds: [embed] });
}

async function sendSILK(message: Message, user: IUser): Promise<string> {
  const words = message.content.split(' ');

  if (words.length < 3) {
    message.channel.send('Please provide a valid recipient and amount');
    message.channel.send('USAGE: .send [@user|0xaddr] [amount]');
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
    message.channel.send('Please provide a valid recipient and amount');
    message.channel.send('USAGE: .transfer [@user|0xaddr] [id]');
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

  const tokenID = words[2];
  if (!tokenID || isNaN(Number(tokenID))) {
    message.reply('Please provide a valid token id');
    return;
  }
  let nftOwner = '';
  try {
    nftOwner = await nftService.getNFTOwner(tokenID);
  } catch (error) {
    message.reply('Token non-existent');
    return;
  }
  if (nftOwner !== user.wallet.address) {
    message.reply('You do not own this NFT');
    return;
  }
  const txHash = await nftService.transfer(user.wallet.mnemonic, address, tokenID);
  await message.channel.send(`Sent token #${tokenID} to ${address}`);
  await message.channel.send(`Transaction: ${txHash}`);
}

export default {
  getTokenMetadata,
  getTokenMetadataAndDM,
  sendSILK,
  transferNFT,
};
