import TokenController from '@/controllers/token.controller';

const routes = [
  {
    command: '.get',
    handler: TokenController.getTokenMetadata,
  },
  {
    command: '.wget',
    handler: TokenController.getTokenMetadataAndDM,
  },
  {
    command: '.send',
    handler: TokenController.sendSILK,
  },
  {
    command: '.transfer',
    handler: TokenController.transferNFT,
  },
];

export default routes;
