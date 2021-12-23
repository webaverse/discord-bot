import config from '@/config';
import MintingController from '@/controllers/minting.controller';

const routes = [
  {
    command: config.botPrefix + 'mint',
    handler: MintingController.mint,
  },
];

export default routes;
