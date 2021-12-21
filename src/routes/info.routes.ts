import InfoController from '@/controllers/info.controller';

const routes = [
  {
    command: '.status',
    handler: InfoController.showStatus,
  },
  {
    command: '.balance',
    handler: InfoController.showSILKBalance,
  },
  {
    command: '.inventory',
    handler: InfoController.showNFTInventory,
  },
  {
    command: '.address',
    handler: InfoController.showWalletAddress,
  },
  {
    command: '.key',
    handler: InfoController.showWalletPrivateKey,
  },
  {
    command: '.login',
    handler: InfoController.createLoginLink,
  },
];

export default routes;
