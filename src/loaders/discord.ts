import { Client, Message } from 'discord.js';
import routes from '@/routes';
import userService from '@/services/user.service';

async function routeMessage(message: Message): Promise<void> {
  const command = message.content.split(' ')[0];
  for (const route of routes.messageRoutes) {
    if (route.command === command) {
      let user = await userService.getUser(message.author.id);
      if (!user) {
        user = await userService.createUser(message.author.id, message.author.username);
      }
      await route.handler(message, user);
      break;
    }
  }
  return;
}

async function routeDM(message: Message): Promise<void> {
  const command = message.content.split(' ')[0];
  for (const route of routes.dmRoutes) {
    if (route.command === command) {
      let user = await userService.getUser(message.author.id);
      if (!user) {
        user = await userService.createUser(message.author.id, message.author.username);
      }
      await route.handler(message, user);
      break;
    }
  }
  return;
}

export default async (client: Client): Promise<void> => {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: 'Webaverse.com',
          type: 'PLAYING',
          url: 'https://webaverse.com',
        },
      ],
    });
  });
  /*
   * TODO:
   * messageReactionAdd
   * messageReactionRemove
   */
  client.on('message', async message => {
    // Making sure the message is not from the bot itself
    if (message.author.bot) return;
    // Making sure the message is a command for bot
    if (!message.content.startsWith('.')) return;

    // It's a message in channel
    if (message.channel.type === 'GUILD_TEXT') {
      await routeMessage(message);
    }

    // It's a DM to Bot
    if (message.channel.type === 'DM') {
      await routeDM(message);
    }
  });
};
