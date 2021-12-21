export interface IUser {
  id: string;
  name: string;
  description: string;
  avatarId: string;
  homeSpaceId: string;
  avatarPreview: string;
  homeSpacePreview: string;
  homeSpaceExt: string;
  avatarExt: string;
  address: string;
  wallet: {
    address: string;
    mnemonic: string;
  };
}

export interface IUserDB {
  id: string;
  name: string;
  description: string;
  avatarId: string;
  homeSpaceId: string;
  avatarPreview: string;
  homeSpacePreview: string;
  homeSpaceExt: string;
  avatarExt: string;
  address: string;
}
