import config from '@/config';
import HelpController from '@/controllers/help.controller';

const routes = [
  {
    command: config.botPrefix + 'help',
    handler: HelpController.showHelp,
  },
];

export default routes;
