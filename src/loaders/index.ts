import dynamooseLoader from './dynamoose';
import Logger from './logger';
import discordLoader from './discord';
import { Client } from 'discord.js';

export default async (client: Client): Promise<void> => {
  await dynamooseLoader();
  Logger.info('✌️ DB loaded and connected!');

  await discordLoader(client);
  Logger.info('✌️ Discord Bot loaded');
};
