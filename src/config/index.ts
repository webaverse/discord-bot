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
    address: '0x5D31B1BAc74A55A2D475d069E698Eb814EcD7eAe',
    abi: erc20ABI.abi,
  },
  erc721: {
    address: '0x1EB475A4510536cb26d3AF9e545436ae18ef1Ad6',
    abi: erc721ABI.abi,
  },
  webaverse: {
    address: '0xb829eEdB1086d3A3057126e94712A6925AB55c4c',
    abi: webaverseABI.abi,
  },
  accounts: {
    address: '0xEE64CB0278f92a4A20cb8F2712027E89DE0eB85e',
    abi: accountsABI.abi,
  },
};
