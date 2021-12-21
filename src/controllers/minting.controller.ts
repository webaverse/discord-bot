import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';
import * as ipfsClient from 'ipfs-http-client';
import config from '@/config';
import FTService from '@/services/FT.service';
import { utils } from 'ethers';
import userService from '@/services/user.service';
import nftService from '@/services/nft.service';
import { INFT } from '@/interfaces/NFT.interface';
import { IUser } from '@/interfaces/user.interface';
import { extname } from 'path';
import * as mime from 'mime-types';
import url from 'url';

async function mint(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  let fileURL, name;
  let ext = '';

  if (words.length === 2) {
    if (message.attachments.size === 0) {
      await message.channel.send('Please provide a file attachment or a URL');
      return;
    }

    if (message.attachments.size > 1) {
      await message.channel.send('Please provide only one file attachment');
      return;
    }

    const attachment = message.attachments.first();

    name = words[1];
    fileURL = attachment.url;
    ext = extname(url.parse(attachment.url).pathname);
  } else if (words.length === 3) {
    const fileLink = words[2];
    if (!fileLink.match(/^http(s)?:\/\//)) {
      await message.channel.send('Please provide a valid URL');
      return;
    }
    fileURL = fileLink;
    name = words[1];
    ext = extname(url.parse(fileLink).pathname);
  } else {
    message.reply('Invalid command. Please use `.mint [name] or .mint [name] [url]`');
  }

  const mintFee = await nftService.getMintFee();
  const balanceBN = utils.parseEther(await FTService.getBalance(user.wallet.address));
  const mintFeeBN = utils.parseEther(mintFee);

  if (mintFeeBN.gt(balanceBN)) {
    await message.channel.send(
      `You don't have enough SILK to mint a new NFT. Minting a NFT costs ${mintFee.toString()} SILK.`,
    );
    return;
  }

  const ipfs = ipfsClient.create({ host: config.ipfs.host, port: config.ipfs.port, protocol: config.ipfs.protocol });
  // fetch the file from the URL and add it to IPFS
  const response = await axios.get(fileURL, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const ipfsFileHash = await ipfs.add(buffer);

  const metadata = {
    name,
    image: `https://preview.webaverse.com/${ipfsFileHash.cid}${ext}/preview.png`,
    hash: ipfsFileHash.cid.toString(),
    ext: ext.replace('.', ''),
  };
  const { path } = await ipfs.add(JSON.stringify(metadata));
  await FTService.approve(user.wallet.mnemonic, config.webaverse.address, mintFeeBN);
  const txHash = await nftService.mint(user.wallet.mnemonic, path);
  await message.channel.send('NFT minted successfully');
  await message.channel.send(`Transaction: ${txHash}`);
}

export default {
  mint,
};
