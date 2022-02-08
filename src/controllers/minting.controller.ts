import { Message } from 'discord.js';
import fetch from 'node-fetch';
import config from '@/config';
import FTService from '@/services/FT.service';
import { BigNumber, utils } from 'ethers';
import nftService from '@/services/nft.service';
import { IUser } from '@/interfaces/user.interface';
import { extname } from 'path';
import url from 'url';
import FormData from 'form-data';
import AdmZip from 'adm-zip';
import request from 'request';

async function mint(message: Message, user: IUser): Promise<void> {
  const words = message.content.trim().split(' ');

  let fileURL;
  let ext = '';
  let balance = 1;

  if (words.length < 2 && words.length > 3) {
    message.reply('Invalid command');
    return;
  }

  if (words.length === 3) {
    if (!words[1].match(/^http(s)?:\/\//)) {
      message.reply('Invalid URL');
      return;
    }

    fileURL = words[1];
    balance = Number.parseInt(words[2]);
    ext = extname(url.parse(fileURL).pathname);
    if (isNaN(balance)) {
      message.reply('Invalid balance value');
      return;
    }
  } else if (words.length === 2) {
    if (words[1].match(/^http(s)?:\/\//)) {
      fileURL = words[1];
      ext = extname(url.parse(fileURL).pathname);
    } else {
      if (message.attachments.size === 0) {
        await message.channel.send('Please provide a file attachment or a URL');
        return;
      }
      if (message.attachments.size > 1) {
        await message.channel.send('Please provide only one file attachment');
        return;
      }

      const attachment = message.attachments.first();

      fileURL = attachment.url;
      ext = extname(url.parse(attachment.url).pathname);
      balance = Number.parseInt(words[1]);
      if (isNaN(balance)) {
        message.reply('Invalid balance value');
        return;
      }
    }
  } else if (words.length === 1) {
    if (message.attachments.size === 0) {
      await message.channel.send('Please provide a file attachment or a URL');
      return;
    }

    if (message.attachments.size > 1) {
      await message.channel.send('Please provide only one file attachment');
      return;
    }

    const attachment = message.attachments.first();

    fileURL = attachment.url;
    ext = extname(url.parse(attachment.url).pathname);
  } else {
    message.reply(`Invalid command.`);
    return;
  }

  if (!ext) {
    await message.channel.send('Unrecognized file extension');
    return;
  }

  const mintFee = await nftService.getMintFee();
  const balanceBN = utils.parseEther(await FTService.getBalance(user.wallet.address));
  const mintFeeBN = utils.parseEther(mintFee);
  console.log('Balance: ', balanceBN.toString(), '  Minting Fee: ', mintFeeBN.toString());
  if (mintFeeBN.gt(balanceBN)) {
    await message.channel.send(
      `You don't have enough SILK to mint a new NFT. Minting a NFT costs ${mintFee.toString()} SILK.`,
    );
    return;
  }

  try {
    let ipfsFileHash = '';

    if (ext === '.zip') {
      const fd = new FormData();
      const files = await download(fileURL).then(unzip);
      for (const file of files) {
        fd.append(file.path, file.content, {
          filename: file.path.split('/').pop(),
        });
      }
      ipfsFileHash = (
        await fetch(config.ipfsURL + '/upload-folder', {
          method: 'POST',
          body: fd,
        }).then(res => res.json() as unknown as { cid: string })
      ).cid;
      ext = '.metaversefile';
    } else {
      const imageBuffer = (await download(fileURL)) as Buffer;

      const fd = new FormData();

      fd.append('binary_data', imageBuffer, {
        filename: `file${ext}`,
      });

      ipfsFileHash = (
        await fetch(config.ipfsURL, {
          method: 'POST',
          body: fd,
        }).then(res => res.json() as unknown as Array<{ name: string; hash: string }>)
      )[0].hash;
    }
    await message.reply(`IPFS: ${ipfsFileHash}`);

    if (mintFeeBN.gt(BigNumber.from(0))) {
      await message.reply('Approving SILK for NFT minting...');
      await FTService.approve(user.wallet.mnemonic, config.webaverse.address, mintFeeBN);
    }
    await message.reply('NFT initiated minting...');
    const txHash = await nftService.mint(user.wallet.mnemonic, ipfsFileHash, ext.replace('.', ''), balance);
    await message.reply('NFT minted successfully');
    await message.reply(`Transaction: ${txHash}`);
  } catch (error) {
    console.log(error);
    await message.reply('An error occurred while minting the NFT');
    throw new Error(error);
  }
}

const download = function (url) {
  return new Promise(function (resolve, reject) {
    request(
      {
        url: url,
        method: 'GET',
        encoding: null,
      },
      function (err, response, body) {
        if (err) {
          return reject(err);
        }
        resolve(body);
      },
    );
  });
};

const unzip = function (buffer): Promise<Array<{ path: string; content: Buffer }>> {
  return new Promise(function (resolve) {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries(); // an array of ZipEntry records
    const files = [];
    for (const file of zipEntries) {
      files.push({
        path: file.entryName,
        content: file.getData(),
      });
    }
    resolve(files);
  });
};

export default {
  mint,
};
