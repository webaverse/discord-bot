import config from '@/config';
import SecureCmdController from '@/controllers/secure-cmd.controller';

const routes = [
  {
    command: config.botPrefix + 'key',
    handler: SecureCmdController.updateMnemonic,
  },
];

export default routes;
