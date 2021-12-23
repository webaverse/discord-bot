import { Message } from 'discord.js';
import fetch from 'node-fetch';
import config from '@/config';
import FTService from '@/services/FT.service';
import { utils } from 'ethers';
import nftService from '@/services/nft.service';
import { IUser } from '@/interfaces/user.interface';
import { extname } from 'path';
import url from 'url';
import FormData from 'form-data';

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
    message.reply(
      `Invalid command. Please use \`${config.botPrefix}mint [name] or ${config.botPrefix}mint [name] [url]\``,
    );
    return;
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

  // fetch the file from the URL and add it to IPFS
  const response = await fetch(fileURL).then(res => res.arrayBuffer());
  const imageBuffer = Buffer.from(response);
  const fd = new FormData();

  fd.append('binary_data', imageBuffer.toString('utf8'), {
    filename: name,
  });

  const ipfsFileHash: { name: string; hash: string } = await fetch(config.ipfsURL, {
    method: 'POST',
    body: fd,
  }).then(res => res.json() as unknown as { name: string; hash: string });

  const metadata = {
    name,
    image: `https://preview.webaverse.com/${ipfsFileHash.hash}${ext}/preview.png`,
    hash: ipfsFileHash.hash,
    ext: ext.replace('.', ''),
  };

  const metadataBuffer = Buffer.from(JSON.stringify(metadata));

  const metadataForm = new FormData();

  metadataForm.append('binary_data', metadataBuffer.toString('utf8'), {
    filename: 'metadata.json',
  });

  const ipfsMetadataHash: { name: string; hash: string } = await fetch(config.ipfsURL, {
    method: 'POST',
    body: metadataForm,
  }).then(res => res.json() as unknown as { name: string; hash: string });

  await FTService.approve(user.wallet.mnemonic, config.webaverse.address, mintFeeBN);
  const txHash = await nftService.mint(user.wallet.mnemonic, ipfsMetadataHash.hash);
  await message.channel.send('NFT minted successfully');
  await message.channel.send(`Transaction: ${txHash}`);
}

export default {
  mint,
};
