import config from '@/config';
import AccountController from '@/controllers/account.controller';

const routes = [
  {
    command: config.botPrefix + 'name',
    handler: AccountController.setName,
  },
  {
    command: config.botPrefix + 'avatar',
    handler: AccountController.setAvatar,
  },
  {
    command: config.botPrefix + 'homespace',
    handler: AccountController.setHomeSpace,
  },
  {
    command: config.botPrefix + 'loadout',
    handler: AccountController.setLoadout,
  },
  {
    command: config.botPrefix + 'monetizationpointer',
    handler: AccountController.setMonetizationPointer,
  },
];

export default routes;
