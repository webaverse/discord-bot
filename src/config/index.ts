import dotenv from 'dotenv';
import erc20ABI from '@/abi/WebaverseERC20.json';
import erc721ABI from '@/abi/WebaverseERC721.json';
import webaverseABI from '@/abi/Webaverse.json';
import accountsABI from '@/abi/Accounts.json';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  /**
   * Discord Bot API token
   */
  discordApiToken: process.env.DISCORD_BOT_TOKEN,

  /*
   *
   * URL for the Webaverse Blockhain Sync Server
   */
  syncServerURL: process.env.SYNC_SERVER_URL,

  /*
   *
   * URL for the webaverse sidechain
   */
  sidechainURL: process.env.SIDE_CHAIN_URL,

  /*
   *
   * IPFS connection details
   */
  ipfsURL: process.env.IPFS_URL,

  /*
   *
   * AWS Database credentials
   */
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-west-1',

  /*
   *
   * Prefix for bot commands
   */

  botPrefix: process.env.COMMAND_PREFIX,

  /*
   *
   * Number of recent messages to be stored in the message store
   */
  messageStoreSize: 150,

  /*
   *
   * Contract addresses and abis for the webaverse contracts
   */
  erc20: {
    address: '0x7d205bFe4911d27B1FF1E02Dd3E1238Da714C72E',
    abi: erc20ABI.abi,
  },
  erc721: {
    address: '0xb6fb5ECe738b8A79AD8A28Bd8f5f7581E348852f',
    abi: erc721ABI.abi,
  },
  webaverse: {
    address: '0x6C0Afe895D6e3141Ffc9302Fa4eF4cCD12c63Bdc',
    abi: webaverseABI.abi,
  },
  accounts: {
    address: '0xEE64CB0278f92a4A20cb8F2712027E89DE0eB85e',
    abi: accountsABI.abi,
  },
};
