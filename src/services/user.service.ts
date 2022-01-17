import { IUser, IUserAccount } from '@/interfaces/user.interface';
import { generateMnemonic } from 'bip39';
import { Wallet } from 'ethers';
import config from '@/config';
import { DynamoDB, Config, Credentials } from 'aws-sdk';
import fetch from 'node-fetch';
import { ethers, BigNumber } from 'ethers';

const awsConfig = new Config({
  credentials: new Credentials({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  }),
  region: config.region,
});

const ddb = new DynamoDB(awsConfig);

/*
 *
 * Get a user by their ID. If the user does not exists in the database, create it.
 *
 */
const getUser = async (userID: string): Promise<IUser> => {
  const { mnemonic, address } = await _getUserMnemonic(userID);
  const userData = await fetch(`${config.syncServerURL}/account/${address}`).then(res => res.json());
  const user: IUser = {
    id: userID,
    name: userData.name || '',
    avatarExt: userData.avatarExt || '',
    loadout: userData.loadout || '',
    homeSpacePreview: userData.homeSpacePreview || '',
    addressProofs: userData.addressProofs || '',
    homeSpaceId: userData.homeSpaceId || '',
    address: userData.address || '',
    ftu: userData.ftu || '',
    description: userData.description || '',
    avatarPreview: userData.avatarPreview || '',
    avatarName: userData.avatarName || '',
    avatarId: userData.avatarId || '',
    homeSpaceName: userData.homeSpaceName || '',
    homeSpaceExt: userData.homeSpaceExt || '',
    monetizationPointer: userData.monetizationPointer || '',
    wallet: {
      address,
      mnemonic,
    },
  };
  return user;
};

const getUserByAddress = async (address: string): Promise<IUserAccount> => {
  const userData = await fetch(`${config.syncServerURL}/account/${address}`).then(res => res.json());
  const user: IUserAccount = {
    id: '',
    name: userData.name || '',
    avatarExt: userData.avatarExt || '',
    loadout: userData.loadout || '',
    homeSpacePreview: userData.homeSpacePreview || '',
    addressProofs: userData.addressProofs || '',
    homeSpaceId: userData.homeSpaceId || '',
    address: userData.address || '',
    ftu: userData.ftu || '',
    description: userData.description || '',
    avatarPreview: userData.avatarPreview || '',
    avatarName: userData.avatarName || '',
    avatarId: userData.avatarId || '',
    homeSpaceName: userData.homeSpaceName || '',
    homeSpaceExt: userData.homeSpaceExt || '',
    monetizationPointer: userData.monetizationPointer || '',
  };
  return user;
};

async function setName(userID: string, name: string): Promise<void> {
  const { address, mnemonic } = await _getUserMnemonic(userID);
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

  const contract = new ethers.Contract(config.accounts.address, config.accounts.abi, wallet);
  const tx = await contract.setMetadata(address, 'name', name, {
    gasLimit: 1000000,
  });
  return tx.hash;
}

async function setAvatar(
  userID: string,
  avatarId: string,
  avatarName: string,
  avatarPreview: string,
  avatarExt: string,
): Promise<void> {
  const { address, mnemonic } = await _getUserMnemonic(userID);
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.accounts.address, config.accounts.abi, wallet);

  await contract.setMetadata(address, 'avatarId', avatarId, {
    gasLimit: 1000000,
  });
  await contract.setMetadata(address, 'avatarName', avatarName, {
    gasLimit: 1000000,
  });
  await contract.setMetadata(address, 'avatarPreview', avatarPreview, {
    gasLimit: 1000000,
  });
  await contract.setMetadata(address, 'avatarExt', avatarExt, {
    gasLimit: 1000000,
  });
}

async function setHomeSpace(
  userID: string,
  homeSpaceId: string,
  homeSpaceName: string,
  homeSpacePreview: string,
  homeSpaceExt: string,
): Promise<void> {
  const { address, mnemonic } = await _getUserMnemonic(userID);
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.accounts.address, config.accounts.abi, wallet);
  await contract.setMetadata(address, 'homeSpaceId', homeSpaceId, {
    gasLimit: 1000000,
  });
  await contract.setMetadata(address, 'homeSpaceName', homeSpaceName, {
    gasLimit: 1000000,
  });
  await contract.setMetadata(address, 'homeSpacePreview', homeSpacePreview, {
    gasLimit: 1000000,
  });
  await contract.setMetadata(address, 'homeSpaceExt', homeSpaceExt, {
    gasLimit: 1000000,
  });
}

async function setLoadout(userID: string, loadout: string): Promise<void> {
  const { address, mnemonic } = await _getUserMnemonic(userID);
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.accounts.address, config.accounts.abi, wallet);
  await contract.setMetadata(address, 'loadout', loadout, {
    gasLimit: 1000000,
  });
}

async function setMonetizationPointer(userID: string, pointer: string): Promise<void> {
  const { address, mnemonic } = await _getUserMnemonic(userID);
  const provider = new ethers.providers.JsonRpcProvider(config.sidechainURL);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contract = new ethers.Contract(config.accounts.address, config.accounts.abi, wallet);
  await contract.setMetadata(address, 'monetizationPointer', pointer, {
    gasLimit: 1000000,
  });
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
}

async function addCode(userID: string, code: string): Promise<void> {
  await ddb
    .putItem({
      TableName: 'users',
      Item: {
        email: { S: userID + '.code' },
        code: { S: code },
      },
    })
    .promise();
}

/* Private functions below */
const _getUserMnemonic = async (id: string) => {
  const tokenItem = await ddb
    .getItem({
      TableName: 'users',
      Key: {
        email: { S: id + '.discordtoken' },
      },
    })
    .promise();

  let mnemonic = tokenItem.Item && tokenItem.Item.mnemonic ? tokenItem.Item.mnemonic.S : null;
  let address = '';
  if (!mnemonic) {
    mnemonic = generateMnemonic();
    address = (await Wallet.fromMnemonic(mnemonic).getAddress()).toLowerCase();
    await ddb
      .putItem({
        TableName: 'users',
        Item: {
          email: { S: id + '.discordtoken' },
          mnemonic: { S: mnemonic },
        },
      })
      .promise();
  } else {
    address = (await Wallet.fromMnemonic(mnemonic).getAddress()).toLowerCase();
  }

  return { mnemonic, address };
};

export default {
  getUser,
  getUserByAddress,
  setName,
  setAvatar,
  setHomeSpace,
  setLoadout,
  setMonetizationPointer,
  setMnemonic,
  addCode,
};
