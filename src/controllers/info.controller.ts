import { Message, MessageEmbed } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import FTService from '@/services/FT.service';
import { utils } from 'ethers';
import userService from '@/services/user.service';
import nftService from '@/services/nft.service';
import { INFT } from '@/interfaces/NFT.interface';
import crypto from 'crypto';

async function showStatus(message: Message, user: IUser): Promise<void> {
  if (message.content.toLowerCase() !== '.status') return;
  const returnMessage = new MessageEmbed()
    .setColor('#000000')
    .setTitle(user.name)
    .setURL(`https://webaverse.com/creators/${user.wallet.address}`)
    .setDescription(user.description || 'This person is a noob without a description.')
    .setThumbnail(user.avatarPreview) // avatarPreview
    .addFields(
      { name: 'Avatar ID', value: user.avatarId || '<none>' },
      { name: 'Homespace ID', value: user.homeSpaceId || '<none>' },
    )
    .setImage(user.homeSpacePreview) // avatarPreview
    .setTimestamp()
    .setFooter('.help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
  const m = await message.channel.send({ embeds: [returnMessage] });
  m.react('❌');
}

async function showSILKBalance(message: Message): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words[0] !== '.balance') return;
  if (words.length === 1) words.push(`<@!${message.author.id}>`);
  let address = words[1];
  if (!utils.isAddress(words[1].trim()) && words[1].startsWith('<@!') && words[1].endsWith('>')) {
    const user = await userService.getUser(words[1].toLowerCase().replace('<@!', '').replace('>', ''));
    if (!user) return;
    address = user.wallet.address;
  }

  let balance = '0';
  balance = await FTService.getBalance(address);
  if (words[1].startsWith('<@!') && words[1].endsWith('>')) {
    let returnMessage = `${words[1]} has ${balance} SILK.`;
    if (`${balance}` === '0.0') {
      returnMessage += 'Want to get some SILK? Ask the Webaverse team.';
    }
    await message.reply(returnMessage);
  } else {
    await message.reply(`${address} has ${balance} SILK.`);
  }
}

async function showNFTInventory(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words[0] !== '.inventory') return;
  if (words.length === 1) words.push(user.wallet.address);
  if (!utils.isAddress(words[1]) && !words[1].startsWith('<@!') && !words[1].endsWith('>')) return;

  const username = words[1];

  if (words[1].startsWith('<@!') && words[1].endsWith('>')) {
    const user = await userService.getUser(words[1].toLowerCase().replace('<@!', '').replace('>', ''));
    if (!user) {
      await message.channel.send('User not found.');
      return;
    }
    words[1] = user.wallet.address;
  }
  if (!utils.isAddress(words[1])) {
    await message.channel.send('Invalid address.');
    return;
  }
  const nfts: INFT[] = await nftService.getNFTs(words[1]);
  if (nfts.length === 0) {
    await message.channel.send('No NFTs found.');
    return;
  }
  const embeds = nfts.map(nft => {
    return new MessageEmbed()
      .setColor('#000000')
      .setTitle(`${nft.tokenID} - ${nft.name}`)
      .setDescription(`${nft.description || 'No description.'}`)
      .setThumbnail(nft.image)
      .setURL(nft.external_url)
      .addFields(nft.attributes.map(attribute => ({ name: attribute.trait_type, value: attribute.trait_type })));
  });
  message.channel.send({ content: `${username}'s NFTs`, embeds: embeds });
}

async function showWalletAddress(message: Message): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words[0] !== '.address') return;
  if (words.length !== 2) words.push(`<@!${message.author.id}>`);
  if (!words[1].startsWith('<@!') || !words[1].endsWith('>')) {
    return;
  }
  const user = await userService.getUser(words[1].toLowerCase().replace('<@!', '').replace('>', ''));
  if (!user) {
    await message.reply('User not found.');
    return;
  }
  await message.channel.send(`${words[1]}'s Address: ` + '```' + user.wallet.address + '```');
}

async function showWalletPrivateKey(message: Message, user: IUser): Promise<void> {
  if (message.content.trim() !== '.key') return;
  try {
    await message.author.send('Address: `' + user.wallet.address + '`\nMnemonic: ||' + user.wallet.mnemonic + '||');
  } catch (error) {
    if (error.message === 'Cannot send messages to this user') {
      message.reply('Could not DM you. Please enable DMs from this server.');
      return;
    }
  }
}

async function createLoginLink(message: Message, user: IUser): Promise<void> {
  if (user.name) {
    const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString().slice(-6);
    try {
      await message.author.send(`Login: https://webaverse.com/login?id=${user.id}&code=${code}`);
    } catch (error) {
      if (error.message === 'Cannot send messages to this user') {
        message.reply('Could not DM you. Please enable DMs from this server.');
        return;
      }
    }
  } else {
    const discordName = message.author.username;
    await userService.setName(user.id, discordName);

    const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString().slice(-6);
    await userService.addCode(user.id, code);
    try {
      await message.author.send(`Login: https://app.webaverse.com/login?id=${user.id}&code=${code}`);
    } catch (error) {
      if (error.message === 'Cannot send messages to this user') {
        message.reply('Could not DM you. Please enable DMs from this server.');
        return;
      }
    }
  }
}

export default {
  showStatus,
  showSILKBalance,
  showNFTInventory,
  showWalletAddress,
  showWalletPrivateKey,
  createLoginLink,
};
