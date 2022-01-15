import { Message } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import userService from '@/services/user.service';
import config from '@/config';
import nftService from '@/services/nft.service';
import { URL } from 'url';

async function setName(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  if (words.length !== 2) {
    message.channel.send('Please provide a name');
    message.channel.send(`USAGE: ${config.botPrefix}name [newname]`);
    return;
  }
  const name = words[1];
  await userService.setName(user.id, name);
  await message.reply(`Name set to ${name}`);
}

async function setAvatar(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  if (words.length !== 2) {
    message.channel.send('Please provide a id');
    message.channel.send(`USAGE: ${config.botPrefix}avatar [id]`);
    return;
  }

  const tokenID = words[1];

  let name = '';
  let avatarPreview = '';
  let ext = '';

  if (tokenID && !isNaN(Number(tokenID))) {
    const nft = await nftService.getNFT(tokenID);
    if (!nft) {
      message.reply('Please provide a valid token id');
      return;
    }
    name = nft.name;
    ext = nft.ext;
    avatarPreview = `https://preview.webaverse.com/${nft.hash}${ext ? '.' + ext : ''}/preview.png`;
  }

  if (tokenID.startsWith('http')) {
    const url = new URL(tokenID);
    const path = url.pathname;
    ext = path.split('.').pop();
    name = path.split('/').pop();
    avatarPreview = `https://preview.webaverse.com/[${tokenID}]/preview.png`;
  }

  await userService.setAvatar(user.id, tokenID, name, avatarPreview, ext);
  await message.reply(`Avatar ID set to ${tokenID}`);
}

async function setHomeSpace(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  if (words.length !== 2) {
    message.channel.send('Please provide a id');
    message.channel.send(`USAGE: ${config.botPrefix}homespace [id]`);
    return;
  }
  const tokenID = words[1];
  let name = '';
  let avatarPreview = '';
  let ext = '';

  if (tokenID && !isNaN(Number(tokenID))) {
    const nft = await nftService.getNFT(tokenID);
    if (!nft) {
      message.reply('Please provide a valid token id');
      return;
    }
    name = nft.name;
    ext = nft.ext;
    avatarPreview = `https://preview.webaverse.com/${nft.hash}${ext ? '.' + ext : ''}/preview.png`;
  }

  if (tokenID.startsWith('http')) {
    const url = new URL(tokenID);
    const path = url.pathname;
    ext = path.split('.').pop();
    name = path.split('/').pop();
    avatarPreview = `https://preview.webaverse.com/[${tokenID}]/preview.png`;
  }

  await userService.setHomeSpace(user.id, tokenID, name, avatarPreview, ext);
  await message.reply(`Homespace ID set to ${tokenID}`);
}

async function setLoadout(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words.length !== 3) {
    message.reply('Invalid command');
    return;
  }
  const slot = words[1];
  const tokenID = words[2];
  if (isNaN(Number(slot)) || Number(slot) < 1 || Number(slot) > 8) {
    message.reply('Invalid value for loadout number. Must be between 1 to 8');
    return;
  }
  if (isNaN(Number(tokenID))) {
    message.reply('Invalid value for token id');
    return;
  }
  const nft = await nftService.getNFT(tokenID);
  if (!nft) {
    message.reply('Invalid token id');
    return;
  }
  let loadout = [];
  try {
    JSON.parse(user.loadout);
  } catch (error) {
    loadout = [null, null, null, null, null, null, null, null];
  }
  loadout[Number(slot) - 1] = {
    id: nft.id,
    name: nft.name,
    ext: nft.ext,
    itemPreview: `https://preview.webaverse.com/${nft.hash}${nft.ext ? '.' + nft.ext : ''}/preview.png`,
  };
  await userService.setLoadout(user.id, JSON.stringify(loadout));
  await message.reply(`Loadout ${slot} set to ${nft.name}`);
}

async function setMonetizationPointer(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');
  if (words.length !== 2) {
    message.reply('Invalid command');
    return;
  }
  const pointer = words[1];
  await userService.setMonetizationPointer(user.id, pointer);
  await message.reply(`Monetization pointer set to ${pointer}`);
}

export default {
  setName,
  setAvatar,
  setHomeSpace,
  setLoadout,
  setMonetizationPointer,
};
