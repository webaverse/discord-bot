import dotenv from 'dotenv';
import erc20ABI from '@/abi/WebaverseERC20.json';
import erc721ABI from '@/abi/WebaverseERC721.json';
import webaverseABI from '@/abi/Webaverse.json';

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
  ipfs: {
    host: process.env.IPFS_HOST,
    port: Number.parseInt(process.env.IPFS_PORT),
    protocol: process.env.IPFS_PROTOCOL,
  },

  /*
   *
   * AWS Database credentials
   */
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-west-1',

  /*
   *
   * Contract addresses and abis for the webaverse contracts
   */
  erc20: {
    address: '0xde03D1F132A7bF38d858Fd78a283572821179546',
    abi: erc20ABI.abi,
  },
  erc721: {
    address: '0x0cE21A5Fa1E3c50AF683c20Ad49C36c6c01316Ea',
    abi: erc721ABI.abi,
  },
  webaverse: {
    address: '0xB97f9250e8164b1C5A19b233D744F02b6277cB70',
    abi: webaverseABI.abi,
  },
};
