import config from '@/config';
import TokenController from '@/controllers/token.controller';

const routes = [
  {
    command: config.botPrefix + 'view',
    handler: TokenController.getTokenMetadata,
  },
  {
    command: config.botPrefix + 'wget',
    handler: TokenController.getTokenMetadataAndDM,
  },
  {
    command: config.botPrefix + 'send',
    handler: TokenController.sendSILK,
  },
  {
    command: config.botPrefix + 'transfer',
    handler: TokenController.transferNFT,
  },
  {
    command: config.botPrefix + 'get',
    handler: TokenController.getNFTMetadata,
  },
  {
    command: config.botPrefix + 'set',
    handler: TokenController.setNFTMetadata,
  },
];

export default routes;
