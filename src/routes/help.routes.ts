import HelpController from '@/controllers/help.controller';

const routes = [
  {
    command: '.help',
    handler: HelpController.showHelp,
  },
];

export default routes;
