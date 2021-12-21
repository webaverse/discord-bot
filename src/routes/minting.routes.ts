import MintingController from '@/controllers/minting.controller';

const routes = [
  {
    command: '.mint',
    handler: MintingController.mint,
  },
];

export default routes;
