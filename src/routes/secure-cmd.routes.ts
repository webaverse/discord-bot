import SecureCmdController from '@/controllers/secure-cmd.controller';

const routes = [
  {
    command: '.key',
    handler: SecureCmdController.updateMnemonic,
  },
];

export default routes;
