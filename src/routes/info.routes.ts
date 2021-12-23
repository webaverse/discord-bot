import InfoController from '@/controllers/info.controller';
import config from '@/config';

const routes = [
  {
    command: config.botPrefix + 'status',
    handler: InfoController.showStatus,
  },
  {
    command: config.botPrefix + 'balance',
    handler: InfoController.showSILKBalance,
  },
  {
    command: config.botPrefix + 'inventory',
    handler: InfoController.showNFTInventory,
  },
  {
    command: config.botPrefix + 'address',
    handler: InfoController.showWalletAddress,
  },
  {
    command: config.botPrefix + 'key',
    handler: InfoController.showWalletPrivateKey,
  },
  {
    command: config.botPrefix + 'login',
    handler: InfoController.createLoginLink,
  },
];

export default routes;
