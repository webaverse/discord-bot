import config from '@/config';
import { IHelpCommand } from '@/interfaces/help.interface';
import { MessageEmbed, Message } from 'discord.js';

const helpFields: IHelpCommand[] = [
  {
    name: 'Info',
    shortname: 'info',
    commands: [
      ['status', [], 'show account details'],
      ['balance', ['[@user|0xaddr]?'], 'show SILK balance'],
      ['inventory', ['[@user|0xaddr]?'], 'show NFTs'],
      ['address', ['[@user]?'], 'print address'],
      ['key', ['[@user]?'], 'private key (DM)'],
      ['login', [], 'login link (DM)'],
    ],
  },
  {
    name: 'Tokens',
    shortname: 'tokens',
    commands: [
      ['get', ['[id]'], 'get NFT [id]'],
      ['wget', ['[id]'], 'get NFT [id] in DM'],
      ['send', ['[@user|0xaddr]', '[amount]'], 'send [amount] of SILK to user/address'],
      ['transfer', ['[@user|0xaddr]', '[id]'], 'send NFT'],
    ],
  },
  {
    name: 'Account',
    shortname: 'account',
    commands: [
      ['name', ['[newname]'], 'set name to [name]'],
      ['avatar', ['[id]'], 'set avatar'],
      ['homespace', ['[id]'], 'set NFT as home space'],
    ],
  },
  {
    name: 'Minting',
    shortname: 'minting',
    commands: [
      ['mint', ['[name]'], 'mint NFT from file attachment and name it [name]'],
      ['mint', ['[name]', '[url]'], 'mint NFTs from [url] and name it [name]'],
    ],
  },
  // Commenting these out for now, as they are implemented but not receiving events for DMs
  // {
  //   name: 'Secure commands (DM the bot)',
  //   shortname: 'secure',
  //   commands: [
  //     ['key', ['[new mnemonic]'], 'set private key'],
  //     ['key', ['reset'], 'generate new private key'],
  //   ],
  // },
  {
    name: 'Help',
    shortname: 'help',
    commands: [['help', ['[topic]'], 'show help on a topic (info, tokens, account, minting, secure']],
  },
];

async function showHelp(message: Message): Promise<void> {
  if (message.content === config.botPrefix + 'help') {
    await message.channel.send('Here are the available commands:');
    const embeds = [];
    embeds.push(
      new MessageEmbed()
        .setColor('#000000')
        .setTitle('Webaverse Help')
        .setURL(`https://docs.webaverse.com/`)
        .addFields(
          helpFields.map(({ name, commands: cmd }) => {
            return {
              name,
              value:
                '```css\n' + cmd.map(c => `${config.botPrefix}${c[0]} ${c[1].join(' ')} - ${c[2]}`).join('\n') + '```',
            };
          }),
        ),
    );
    await message.channel.send({ embeds });
  } else {
    const words = message.content.trim().split(' ');
    if (words.length !== 2) {
      await message.channel.send(
        `Please provide a topic or write \`${config.botPrefix}help\` for a list of available commands.`,
      );
      return;
    }
    const topic = words[1];
    const helpField = helpFields.find(({ shortname }) => shortname === topic.toLowerCase());
    if (!helpField) {
      await message.channel.send(
        `Please provide a topic or write \`${config.botPrefix}help\` for a list of available commands.`,
      );
      return;
    }
    const embeds = [];
    embeds.push(
      new MessageEmbed()
        .setColor('#000000')
        .setTitle(`Webaverse Help: ${topic}`)
        .setURL(`https://docs.webaverse.com/${topic}`)
        .addField(
          helpField.name,
          '```css\n' +
            helpField.commands.map(c => `${config.botPrefix}${c[0]} ${c[1].join(' ')} - ${c[2]}`).join('\n') +
            '```',
        ),
    );
    await message.channel.send({ embeds });
  }
}

export default {
  showHelp,
};
