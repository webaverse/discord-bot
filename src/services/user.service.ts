import { IUser } from '@/interfaces/user.interface';
import { generateMnemonic } from 'bip39';
import { Wallet } from 'ethers';
import dynamoose from 'dynamoose';
import BotUserModel from '@/models/bot-user-data.model';
import nftService from './nft.service';

const ddb = dynamoose.aws.ddb();

async function createUser(id: string, name: string): Promise<IUser> {
  const mnemonic = generateMnemonic();
  await ddb
    .putItem({
      TableName: 'users',
      Item: {
        email: { S: id + '.discordtoken' },
        mnemonic: { S: mnemonic },
      },
    })
    .promise();

  const wallet = Wallet.fromMnemonic(mnemonic);
  const address = (await wallet.getAddress()).toLowerCase();

  const user = new BotUserModel({
    id,
    name,
    description: '',
    avatarId: '',
    homeSpaceId: '',
    avatarPreview: '',
    homeSpacePreview: '',
    homeSpaceExt: '',
    avatarExt: '',
    address: address,
  });
  await user.save();
  return;
}

async function getUser(id: string): Promise<IUser | null> {
  const tokenItem = await ddb
    .getItem({
      TableName: 'users',
      Key: {
        email: { S: id + '.discordtoken' },
      },
    })
    .promise();
  if (!tokenItem.Item && !tokenItem.Item.mnemonic) {
    return null;
  }
  const mnemonic = tokenItem.Item.mnemonic.S;
  const wallet = Wallet.fromMnemonic(mnemonic);
  const address = await wallet.getAddress();
  const user = await BotUserModel.get(id);
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    description: user.description,
    avatarId: user.avatarId,
    homeSpaceId: user.homeSpaceId,
    homeSpacePreview: user.homeSpacePreview,
    avatarPreview: user.avatarPreview,
    homeSpaceExt: user.homeSpaceExt,
    avatarExt: user.avatarExt,
    address: user.address,
    wallet: {
      address: address.toLowerCase(),
      mnemonic,
    },
  };
}

async function setName(userID: string, name: string): Promise<void> {
  const user = await BotUserModel.get(userID);
  if (!user) {
    return;
  }
  user.name = name;
  await user.save();
}

async function setAvatar(userID: string, nftID: string): Promise<void> {
  const nft = await nftService.getNFT(nftID);
  const user = await BotUserModel.get(userID);
  if (!user) {
    return;
  }
  user.avatarId = nftID;
  user.avatarExt = nft.ext;
  user.avatarPreview = nft.image ? nft.image : `https://preview.webaverse.com/${nft.hash}.${nft.ext}/preview.png`;
  await user.save();
}

async function setHomeSpace(userID: string, nftID: string): Promise<void> {
  const nft = await nftService.getNFT(nftID);
  const user = await BotUserModel.get(userID);
  if (!user) {
    return;
  }
  user.homeSpaceId = nftID;
  user.homeSpaceExt = nft.ext;
  user.homeSpacePreview = nft.image ? nft.image : `https://preview.webaverse.com/${nft.hash}.${nft.ext}/preview.png`;
  await user.save();
}

async function setMnemonic(userID: string, mnemonic: string): Promise<void> {
  await ddb
    .putItem({
      TableName: 'users',
      Item: {
        email: { S: userID + '.discordtoken' },
        mnemonic: { S: mnemonic },
      },
    })
    .promise();
  const user = await BotUserModel.get(userID);
  user.address = (await Wallet.fromMnemonic(mnemonic).getAddress()).toLowerCase();
  await user.save();
}

async function generateNewMnemonic(userID: string): Promise<string> {
  const mnemonic = generateMnemonic();
  await ddb
    .putItem({
      TableName: 'users',
      Item: {
        email: { S: userID + '.discordtoken' },
        mnemonic: { S: mnemonic },
      },
    })
    .promise();
  const user = await BotUserModel.get(userID);
  user.address = (await Wallet.fromMnemonic(mnemonic).getAddress()).toLowerCase();
  await user.save();
  return mnemonic;
}

export default {
  createUser,
  getUser,
  setName,
  setAvatar,
  setHomeSpace,
  setMnemonic,
  generateNewMnemonic,
};
