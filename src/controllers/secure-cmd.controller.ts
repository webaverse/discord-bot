import { Message } from 'discord.js';
import { IUser } from '@/interfaces/user.interface';
import userService from '@/services/user.service';
import { ethers } from 'ethers';

async function updateMnemonic(message: Message, user: IUser): Promise<void> {
  if (message.content.toLowerCase() !== '.key reset') {
    const mnemonic = await userService.generateNewMnemonic(user.id);
    await message.author.send(`Your new mnemonic is: ${mnemonic}`);
    return;
  }
  const mnemonic = message.content.replace('.key ', '');
  if (mnemonic.split(' ').length !== 12 || !ethers.utils.isValidMnemonic(mnemonic)) {
    await message.reply('Invalid mnemonic');
    return;
  }
  await userService.setMnemonic(user.id, mnemonic);
  await message.author.send(`Your new mnemonic is: ${mnemonic}`);
}

export default {
  updateMnemonic,
};
