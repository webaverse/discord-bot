export interface IUserAccount {
  id: string;
  avatarExt: string;
  loadout: string;
  homeSpacePreview: string;
  addressProofs: string;
  homeSpaceId: string;
  address: string;
  name: string;
  ftu: string;
  description: string;
  avatarPreview: string;
  avatarName: string;
  avatarId: string;
  homeSpaceName: string;
  homeSpaceExt: string;
  monetizationPointer: string;
}

export interface IUser extends IUserAccount {
  wallet: {
    address: string;
    mnemonic: string;
  };
}
