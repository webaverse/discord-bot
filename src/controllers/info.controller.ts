import crypto from 'crypto';
import { utils } from 'ethers';
import config from '@/config';
import FTService from '@/services/FT.service';
import userService from '@/services/user.service';
import nftService from '@/services/nft.service';
import { INFT } from '@/interfaces/NFT.interface';
import { IUser } from '@/interfaces/user.interface';
import { Message, MessageEmbed } from 'discord.js';
import { IStoreInventory, IStoreMessage } from '@/interfaces/message.interace';
import messageStoreService from '@/services/message-store.service';

async function showStatus(message: Message, user: IUser): Promise<void> {
  if (message.content.trim() !== `${config.botPrefix}status`) return;
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
    .setFooter(config.botPrefix + 'help for help', 'https://app.webaverse.com/assets/logo-flat.svg');
  const m: IStoreMessage = await message.channel.send(returnMessage);
  m.react('❌');
  m.requester = message.author;
  messageStoreService.addMessage(m);
}

async function showSILKBalance(message: Message): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words[0] !== config.botPrefix + 'balance') return;
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
  if (words[0] !== config.botPrefix + 'inventory') return;
  if (words.length === 1) words.push(user.wallet.address);
  if (!utils.isAddress(words[1]) && !words[1].startsWith('<@!') && !words[1].endsWith('>')) return;

  let userObj = null;
  if (words[1].startsWith('<@!') && words[1].endsWith('>')) {
    const userid = words[1].toLowerCase().replace('<@!', '').replace('>', '');
    userObj = await userService.getUser(userid);
    if (!userObj) {
      await message.channel.send('User not found.');
      return;
    }
  } else if (utils.isAddress(words[1])) {
    userObj = await userService.getUserByAddress(words[1]);
  } else {
    await message.channel.send('Invalid username or address.');
    return;
  }

  const nfts: INFT[] = await nftService.getNFTs(userObj.address);
  if (nfts.length === 0) {
    await message.channel.send('No NFTs found.');
    return;
  }

  const totalPages = Math.ceil(nfts.length / 10);
  const embeds = [];

  console.log(`Total Pages: ${totalPages} \n Total NFTs: ${nfts.length}`);

  for (let pageIndex = 1; pageIndex <= totalPages; pageIndex++) {
    console.log(`Doing: ${pageIndex} / ${totalPages}`);
    const embed = new MessageEmbed()
      .setColor('#000')
      .setTitle(`${userObj.name}'s inventory`)
      .setAuthor(userObj.name, userObj.avatarPreview, `https://webaverse.com/creators/${userObj.address}`)
      .addFields(
        nfts
          .slice(10 * (pageIndex - 1), 10 * pageIndex)
          .map(entry => {
            return {
              name: `${entry.id}) ${entry.name}.${entry.ext}`,
              value: ` ${entry.hash} (${entry.balance}/${entry.totalSupply})`,
              // inline: true,
            };
          })
          .concat([
            {
              name: 'page',
              value: `${pageIndex}/${totalPages}`,
            },
          ]),
      );
    embeds.push(embed);
  }

  const inventoryMessage: IStoreInventory = await message.channel.send(embeds[0]);
  inventoryMessage.react('◀️');
  inventoryMessage.react('▶️');
  inventoryMessage.react('❌');
  inventoryMessage.requester = message.author;
  inventoryMessage.pagination = {
    totalPages,
    currentPage: 1,
    embeds,
    left: async (m: IStoreInventory) => {
      m.pagination.currentPage--;
      if (m.pagination.currentPage < 1) {
        m.pagination.currentPage = m.pagination.totalPages;
      }
      await m.edit(m.pagination.embeds[m.pagination.currentPage - 1]);
    },
    right: async (m: IStoreInventory) => {
      m.pagination.currentPage++;
      if (m.pagination.currentPage > m.pagination.totalPages) {
        m.pagination.currentPage = 1;
      }
      await m.edit(m.pagination.embeds[m.pagination.currentPage - 1]);
    },
  };
  messageStoreService.addMessage(inventoryMessage);
}

async function showWalletAddress(message: Message): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words[0] !== config.botPrefix + 'address') return;
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
  if (message.content.trim() !== config.botPrefix + 'key') return;
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
  if (!user.name) {
    const discordName = message.author.username;
    await userService.setName(user.id, discordName);
  }
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

async function createPlayLink(message: Message, user: IUser): Promise<void> {
  if (!user.name) {
    const discordName = message.author.username;
    await userService.setName(user.id, discordName);
  }
  const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString().slice(-6);
  await userService.addCode(user.id, code);
  try {
    await message.author.send(`Login: https://app.webaverse.com/login?id=${user.id}&code=${code}&play=true`);
  } catch (error) {
    if (error.message === 'Cannot send messages to this user') {
      message.reply('Could not DM you. Please enable DMs from this server.');
      return;
    }
  }
}

async function createRealmLink(message: Message, user: IUser): Promise<void> {
  const id = message.content.trim().split(' ')[1];
  if (!id || isNaN(Number(id)) || Number(id) < 1 || Number(id) > 5) {
    await message.reply('Please provide a valid realm id. Realm id must be between 1-5.');
    return;
  }
  if (!user.name) {
    const discordName = message.author.username;
    await userService.setName(user.id, discordName);
  }
  const code = new Uint32Array(crypto.randomBytes(4).buffer, 0, 1).toString().slice(-6);
  await userService.addCode(user.id, code);
  try {
    await message.author.send(
      `Login: https://app.webaverse.com/login?id=${user.id}&code=${code}&play=true&realmId=${id}`,
    );
  } catch (error) {
    if (error.message === 'Cannot send messages to this user') {
      message.reply('Could not DM you. Please enable DMs from this server.');
      return;
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
  createPlayLink,
  createRealmLink,
};
