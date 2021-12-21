import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';
import { Client, Intents } from 'discord.js';

async function startServer() {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  });

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
