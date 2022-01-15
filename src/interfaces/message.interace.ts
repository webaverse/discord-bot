import { Message, MessageEmbed, User } from 'discord.js';

export interface IStoreMessage extends Message {
  requester?: User;
}

export interface IStoreInventory extends IStoreMessage {
  pagination?: {
    totalPages?: number;
    currentPage?: number;
    embeds?: MessageEmbed[];
    left?: (m: IStoreInventory) => void;
    right?: (m: IStoreInventory) => void;
  };
}
