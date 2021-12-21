import * as dynamoose from 'dynamoose';

const schema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    address: String,
    name: String,
    description: String,
    avatarId: String,
    homeSpaceId: String,
    avatarPreview: String,
    homeSpacePreview: String,
    homeSpaceExt: String,
    avatarExt: String,
  },
  {},
);
const botUserData = dynamoose.model('botUserData', schema);

export default botUserData;
