import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';
import { Client } from 'discord.js';

async function startServer() {
  const client = new Client();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * So we are using good old require.
   **/
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require('./loaders').default(client);

  client.login(config.discordApiToken);
}

startServer();
