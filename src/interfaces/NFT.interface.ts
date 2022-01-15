export interface INFT {
  id: string;
  name: string;
  description: string;
  hash: string;
  ext: string;
  unlockable: string;
  encrypted: string;
  image: string;
  external_url: string;
  animation_url: string;
  properties: {
    name: string;
    hash: string;
    ext: string;
    unlockable: string;
    encrypted: string;
  };
  minterAddress: string;
  minter: {
    avatarName: string;
    avatarId: string;
    avatarExt: string;
    avatarPreview: string;
    name: string;
    mainnetAddress: string;
    addressProofs: string;
    loadout: '';
  };
  ownerAddress: string;
  owner: {
    avatarName: string;
    avatarId: string;
    avatarExt: string;
    avatarPreview: string;
    name: string;
    mainnetAddress: string;
    addressProofs: string;
    loadout: string;
  };
  currentOwnerAddress: string;
  balance: number;
  totalSupply: number;
  buyPrice: number;
  storeId: string;
  currentLocation: string;
  stuckTransactionHash: '';
}
