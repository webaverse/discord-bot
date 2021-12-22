import Logger from './logger';
import discordLoader from './discord';
import { Client } from 'discord.js';

export default async (client: Client): Promise<void> => {
  await discordLoader(client);
  Logger.info('✌️ Discord Bot loaded');
};
