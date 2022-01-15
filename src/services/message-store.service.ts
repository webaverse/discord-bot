import config from '@/config';
import { IStoreInventory, IStoreMessage } from '@/interfaces/message.interace';

const messages: IStoreInventory[] | IStoreMessage[] = [];

function addMessage(message: IStoreMessage | IStoreInventory): void {
  if (messages.length > config.messageStoreSize) {
    messages.shift();
  }
  messages.push(message);
}

function getMessage(id: string): IStoreMessage {
  return messages.find(message => message.id === id);
}

function getMessageAndRemove(id: string): IStoreMessage {
  const index = messages.findIndex(message => message.id === id);
  if (index === -1) {
    return null;
  }
  const message = messages[index];
  messages.splice(index, 1);
  return message;
}

export default {
  addMessage,
  getMessage,
  getMessageAndRemove,
};
