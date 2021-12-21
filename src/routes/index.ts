import infoRoutes from './info.routes';
import helpRoutes from './help.routes';
import tokenRoutes from './token.routes';
import accountRoutes from './account.routes';
import mintingRoutes from './minting.routes';
import SecureCmdRoutes from './secure-cmd.routes';

const messageRoutes = [...infoRoutes, ...helpRoutes, ...tokenRoutes, ...accountRoutes, ...mintingRoutes];

const dmRoutes = [...SecureCmdRoutes];

export default {
  messageRoutes,
  dmRoutes,
};
