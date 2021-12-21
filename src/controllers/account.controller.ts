import { Message } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import userService from '@/services/user.service';

async function setName(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  if (words.length !== 2) {
    message.channel.send('Please provide a name');
    message.channel.send('USAGE: .name [newname]');
  }
  const name = words[1];
  await userService.setName(user.id, name);
  await message.reply(`<@!${user.id}>: Name set to ${name}`);
}

async function setAvatar(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  if (words.length !== 2) {
    message.channel.send('Please provide a id');
    message.channel.send('USAGE: .avatar [id]');
  }
  const tokenID = words[1];
  if (!tokenID || isNaN(Number(tokenID))) {
    message.reply('Please provide a valid token id');
    return;
  }
  await userService.setAvatar(user.id, tokenID);
  await message.reply(`<@!${user.id}>: Avatar ID set to ${tokenID}`);
}

async function setHomeSpace(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  if (words.length !== 2) {
    message.channel.send('Please provide a id');
    message.channel.send('USAGE: .homespace [id]');
  }
  const tokenID = words[1];
  if (!tokenID || isNaN(Number(tokenID))) {
    message.reply('Please provide a valid token id');
    return;
  }
  await userService.setHomeSpace(user.id, tokenID);
  await message.reply(`<@!${user.id}>: Homespace ID set to ${tokenID}`);
}

export default {
  setName,
  setAvatar,
  setHomeSpace,
};
