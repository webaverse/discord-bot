import config from '@/config';
import { DynamoDB, Config, Credentials } from 'aws-sdk';

const awsConfig = new Config({
  credentials: new Credentials({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  }),
  region: config.region,
});

const ddbd = new DynamoDB.DocumentClient({
  ...awsConfig,
});

const ddb = new DynamoDB(awsConfig);

async function getDynamoItem(
  id: DynamoDB.DocumentClient.Key,
  TableName: string,
  consistentRead = false,
): Promise<DynamoDB.DocumentClient.GetItemOutput> {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName,
    Key: id,
    ConsistentRead: consistentRead,
  };

  try {
    return await ddbd.get(params).promise();
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function putDynamoItem(
  id: string,
  data: any,
  TableName: string,
): Promise<DynamoDB.DocumentClient.PutItemOutput | false> {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName,
    Item: {
      ...data,
      id,
    },
  };

  try {
    return ddbd.put(params).promise();
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function getDynamoAllItems(TableName: string): Promise<DynamoDB.DocumentClient.ItemList> {
  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName,
  };

  try {
    const o = await ddbd.scan(params).promise();
    const items = (o && o.Items) || [];
    return items;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default {
  ddb,
  ddbd,
  getDynamoItem,
  putDynamoItem,
  getDynamoAllItems,
};
