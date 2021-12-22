import { Message } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import userService from '@/services/user.service';
import { ethers } from 'ethers';

async function updateMnemonic(message: Message, user: IUser): Promise<void> {
  if (message.content.toLowerCase() !== '.key reset') {
    const mnemonic = await userService.generateNewMnemonic(user.id);
    try {
      await message.author.send(`Your new mnemonic is: ${mnemonic}`);
    } catch (error) {
      if (error.message === 'Cannot send messages to this user') {
        message.reply('Could not DM you. Please enable DMs from this server.');
        return;
      }
    }
    return;
  }
  const mnemonic = message.content.replace('.key ', '');
  if (mnemonic.split(' ').length !== 12 || !ethers.utils.isValidMnemonic(mnemonic)) {
    await message.reply('Invalid mnemonic');
    return;
  }
  await userService.setMnemonic(user.id, mnemonic);
  try {
    await message.author.send(`Your new mnemonic is: ${mnemonic}`);
  } catch (error) {
    if (error.message === 'Cannot send messages to this user') {
      message.reply('Could not DM you. Please enable DMs from this server.');
      return;
    }
  }
}

export default {
  updateMnemonic,
};
