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
   * Contract addresses and abis for the webaverse contracts
   */
  erc20: {
    address: '0x7d205bFe4911d27B1FF1E02Dd3E1238Da714C72E',
    abi: erc20ABI.abi,
  },
  erc721: {
    address: '0xCf5909f2eac709151fFA95459fB14C5E0Ecf0849',
    abi: erc721ABI.abi,
  },
  webaverse: {
    address: '0x2253D5914D5Bccbe50652DB4Ed0A1A2B857a60c4',
    abi: webaverseABI.abi,
  },
};
