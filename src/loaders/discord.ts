import { Client, Message } from 'discord.js';
import routes from '@/routes';
import userService from '@/services/user.service';
import messageStoreService from '@/services/message-store.service';
import config from '@/config';
import { IStoreInventory } from '@/interfaces/message.interace';

async function routeMessage(message: Message): Promise<void> {
  const command = message.content.split(' ')[0];
  console.log(command);
  for (const route of routes.messageRoutes) {
    if (route.command === command) {
      const user = await userService.getUser(message.author.id);
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
      const user = await userService.getUser(message.author.id);
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
      activity: {
        name: 'Webaverse.com',
        type: 'PLAYING',
        url: 'https://webaverse.com',
      },
    });
  });

  client.on('message', async message => {
    // Making sure the message is not from the bot itself
    if (message.author.bot) return;

    // Making sure the message is a command for bot
    if (!message.content.startsWith(config.botPrefix)) return;

    // It's a message in channel
    if (message.channel.type === 'text') {
      await routeMessage(message);
    }

    // It's a DM to Bot
    if (message.channel.type === 'dm') {
      await routeDM(message);
    }
  });

  client.on('messageReactionAdd', async (reaction, user) => {
    const { message, emoji } = reaction;
    if (user.id !== client.user.id && emoji.identifier === '%E2%9D%8C') {
      // x
      if (message.channel.type === 'dm') {
        message.delete();
      } else {
        const msg = messageStoreService.getMessageAndRemove(message.id);
        if (msg) {
          msg.delete();
        }
      }
    } else if (user.id !== client.user.id && emoji.identifier === '%E2%97%80%EF%B8%8F') {
      // left arrow ◀️
      const inventory: IStoreInventory = messageStoreService.getMessage(message.id);
      if (inventory) {
        if (inventory.requester && inventory.requester.id === user.id) {
          inventory.pagination.left(inventory);
        }
      }
    } else if (user.id !== client.user.id && emoji.identifier === '%E2%96%B6%EF%B8%8F') {
      // right arrow ▶️
      const inventory: IStoreInventory = messageStoreService.getMessage(message.id);
      if (inventory.requester && inventory.requester.id === user.id) {
        inventory.pagination.right(inventory);
      }
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    const { message, emoji } = reaction;
    if (user.id !== client.user.id && emoji.identifier === '%E2%97%80%EF%B8%8F') {
      // left arrow ◀️
      const inventory: IStoreInventory = messageStoreService.getMessage(message.id);
      if (inventory.requester && inventory.requester.id === user.id) {
        inventory.pagination.left(inventory);
      }
    } else if (user.id !== client.user.id && emoji.identifier === '%E2%96%B6%EF%B8%8F') {
      // right arrow ▶️
      const inventory: IStoreInventory = messageStoreService.getMessage(message.id);
      if (inventory.requester && inventory.requester.id === user.id) {
        inventory.pagination.right(inventory);
      }
    }
  });
};
