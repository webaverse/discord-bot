import { IUser } from '@/interfaces/user.interface';
import { generateMnemonic } from 'bip39';
import { Wallet } from 'ethers';
import nftService from './nft.service';
import config from '@/config';
import { DynamoDB, Config, Credentials } from 'aws-sdk';

const awsConfig = new Config({
  credentials: new Credentials({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  }),
  region: config.region,
});

const ddb = new DynamoDB(awsConfig);

/*
 * PRIVATE FUNCTIONS BELOW
 */
async function getUserInDB(id: string, consistentRead: boolean) {
  const user = await ddb
    .getItem({
      TableName: 'users',
      Key: {
        email: { S: id + '.discordtoken' },
      },
      ConsistentRead: consistentRead,
    })
    .promise();
  return user?.Item;
}

async function addUserInDB(id: string, mnemonic: string) {
  await ddb
    .putItem({
      TableName: 'users',
      Item: {
        email: { S: id + '.discordtoken' },
        mnemonic: { S: mnemonic },
      },
    })
    .promise();
}
async function getUserDataInDB(id, consistentRead = false) {
  const user = await ddb
    .getItem({
      TableName: 'sidechain-bot-user-data',
      Key: {
        id: { S: id },
      },
      ConsistentRead: consistentRead,
    })
    .promise();
  if (!user?.Item) {
    return null;
  }
  const userObj = user.Item;
  return {
    id: userObj.id?.S || '',
    name: userObj.name?.S || '',
    description: userObj.description?.S || '',
    avatarId: userObj.avatarId?.S || '',
    homeSpaceId: userObj.homeSpaceId?.S || '',
    homeSpacePreview: userObj.homeSpacePreview?.S || '',
    avatarPreview: userObj.avatarPreview?.S || '',
    homeSpaceExt: userObj.homeSpaceExt?.S || '',
    avatarExt: userObj.avatarExt?.S || '',
    address: userObj.address?.S || '',
  };
}

async function addUserDataInDB(
  id: string,
  name: string,
  description: string,
  avatarId: string,
  homeSpaceId: string,
  homeSpacePreview: string,
  avatarPreview: string,
  homeSpaceExt: string,
  avatarExt: string,
  address: string,
) {
  await ddb
    .putItem({
      TableName: `sidechain-bot-user-data`,
      Item: {
        id: { S: id },
        name: { S: name },
        description: { S: description || '' },
        avatarId: { S: avatarId || '' },
        homeSpaceId: { S: homeSpaceId || '' },
        avatarPreview: { S: avatarPreview || '' },
        homeSpacePreview: { S: homeSpacePreview || '' },
        homeSpaceExt: { S: homeSpaceExt || '' },
        avatarExt: { S: avatarExt || '' },
        address: { S: address },
      },
    })
    .promise();
}

async function setUserDataProperty(userID: string, key: string, value: string) {
  const user = await ddb
    .getItem({
      TableName: 'sidechain-bot-user-data',
      Key: {
        id: { S: userID },
      },
      ConsistentRead: true,
    })
    .promise();
  if (!user?.Item) {
    return null;
  }
  const userObj = user.Item;
  userObj[key] = { S: value };

  await ddb
    .putItem({
      TableName: 'sidechain-bot-user-data',
      Item: userObj,
    })
    .promise();
}

/*
 * PRIVATE FUNCTIONS ENDED
 */

async function createUser(id: string, name: string): Promise<IUser> {
  const user = await getUserInDB(id, true);

  let mnemonic = generateMnemonic();
  if (!user) {
    await addUserInDB(id, mnemonic);
    console.log('Mnemonic added for user: ', id);
  } else {
    mnemonic = user.mnemonic.S;
  }

  const wallet = Wallet.fromMnemonic(mnemonic);
  const address = (await wallet.getAddress()).toLowerCase();
  await addUserDataInDB(id, name, '', '', '', '', '', '', '', address);
  return getUser(id, true);
}

async function getUser(id: string, consistentRead = false): Promise<IUser | null> {
  const user = await getUserInDB(id, consistentRead);
  if (!user?.mnemonic?.S) {
    return null;
  }
  const mnemonic: string = user.mnemonic.S;
  const wallet = Wallet.fromMnemonic(mnemonic);
  const address = await wallet.getAddress();

  const userObj = await getUserDataInDB(id, consistentRead);

  if (!user) {
    return null;
  }

  return {
    id: userObj.id,
    name: userObj.name,
    description: userObj.description,
    avatarId: userObj.avatarId,
    homeSpaceId: userObj.homeSpaceId,
    homeSpacePreview: userObj.homeSpacePreview,
    avatarPreview: userObj.avatarPreview,
    homeSpaceExt: userObj.homeSpaceExt,
    avatarExt: userObj.avatarExt,
    address: userObj.address,
    wallet: {
      address: address.toLowerCase(),
      mnemonic,
    },
  };
}

async function setName(userID: string, name: string): Promise<void> {
  await setUserDataProperty(userID, 'name', name);
}

async function setAvatar(userID: string, nftID: string): Promise<void> {
  const nft = await nftService.getNFT(nftID);
  await setUserDataProperty(userID, 'avatarId', nftID);
  await setUserDataProperty(userID, 'avatarExt', nft.ext);
  const imageLink = nft.image ? nft.image : `https://preview.webaverse.com/${nft.hash}.${nft.ext}/preview.png`;
  await setUserDataProperty(userID, 'avatarPreview', imageLink);
}

async function setHomeSpace(userID: string, nftID: string): Promise<void> {
  const nft = await nftService.getNFT(nftID);
  await setUserDataProperty(userID, 'homeSpaceId', nftID);
  await setUserDataProperty(userID, 'homeSpaceExt', nft.ext);
  const imageLink = nft.image ? nft.image : `https://preview.webaverse.com/${nft.hash}.${nft.ext}/preview.png`;
  await setUserDataProperty(userID, 'homeSpacePreview', imageLink);
}

async function setMnemonic(userID: string, mnemonic: string): Promise<void> {
  const address = (await Wallet.fromMnemonic(mnemonic).getAddress()).toLowerCase();
  await addUserInDB(userID, mnemonic);
  await setUserDataProperty(userID, 'address', address);
}

async function generateNewMnemonic(userID: string): Promise<string> {
  const mnemonic = generateMnemonic();
  const address = (await Wallet.fromMnemonic(mnemonic).getAddress()).toLowerCase();
  await addUserInDB(userID, mnemonic);
  await setUserDataProperty(userID, 'address', address);
  return mnemonic;
}

async function addCode(userID: string, code: string): Promise<void> {
  const user = await getUserInDB(userID, true);
  if (!user) {
    return;
  }

  user.code = { S: code };
  console.log('Code added:', user);
  await ddb
    .putItem({
      TableName: 'users',
      Item: user,
    })
    .promise();
}

export default {
  createUser,
  getUser,
  setName,
  setAvatar,
  setHomeSpace,
  setMnemonic,
  generateNewMnemonic,
  addCode,
};
