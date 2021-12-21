import config from '@/config';
import * as dynamoose from 'dynamoose';

export default async (): Promise<void> => {
  // const params = {
  //   TableName: 'botUserData',
  // };

  // dynamoose.aws.ddb().deleteTable(params, function (err, data) {
  //   if (err) {
  //     console.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2));
  //   } else {
  //     console.log('Deleted table. Table description JSON:', JSON.stringify(data, null, 2));
  //   }
  // });
  dynamoose.aws.sdk.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });
};
