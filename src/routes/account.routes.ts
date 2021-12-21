import AccountController from '@/controllers/account.controller';

const routes = [
  {
    command: '.name',
    handler: AccountController.setName,
  },
  {
    command: '.avatar',
    handler: AccountController.setAvatar,
  },
  {
    command: '.homespace',
    handler: AccountController.setHomeSpace,
  },
];

export default routes;
