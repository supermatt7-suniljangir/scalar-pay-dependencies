import {
  DynamoDBClient,
  DynamoDBClientConfig,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import {
  BatchGetCommandInput,
  DynamoDBDocument,
  GetCommandInput,
  PutCommandInput,
  TransactWriteCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { createLogger } from "../utils/Logger";

export class DynamoDBHelper {
  private static readonly className = "DynamoDBHelper";
  private static clientConfig: DynamoDBClientConfig = {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  };
  private static client: DynamoDBClient = new DynamoDBClient(
    DynamoDBHelper.clientConfig
  );
  private static docClient: DynamoDBDocument = DynamoDBDocument.from(
    DynamoDBHelper.client
  );
  private static logger = createLogger("DynamoDBHelper");

  static async getItem<T>(params: GetCommandInput): Promise<T | undefined> {
    this.logger.debug(`${this.className}.getItem:`, params);
    try {
      const response = await this.docClient.get(params);
      return response.Item as T;
    } catch (error) {
      this.logger.error(`${this.className}.getItem error:`, error);
      throw error;
    }
  }

  static async putItem<T>(params: PutCommandInput): Promise<T> {
    this.logger.debug(`${this.className}.createItem:`, params);
    try {
      await this.docClient.put(params);
      return params.Item as T;
    } catch (error) {
      this.logger.error(`${this.className}.createItem error:`, error);
      throw error;
    }
  }

  static async queryItems<T>(
    params: QueryCommandInput
  ): Promise<T | undefined> {
    this.logger.debug(`${this.className}.queryItems:`, params);
    try {
      const result = await this.client.send(new QueryCommand(params));
      if (!result.Items?.[0]) return undefined;

      return unmarshall(result.Items[0]) as T;
    } catch (error) {
      this.logger.error(`${this.className}.queryItems error:`, error);
      throw error;
    }
  }

  static async updateItem<T>(
    params: UpdateCommandInput
  ): Promise<T | undefined> {
    this.logger.debug(`${this.className}.updateItem:`, params);
    try {
      const response = await this.docClient.update(params);
      return response.Attributes as T;
    } catch (error) {
      this.logger.error(`${this.className}.updateItem error:`, error);
      throw error;
    }
  }

  static async batchGetItem<T>(params: BatchGetCommandInput): Promise<T> {
    this.logger.debug(`${this.className}.batchGetItem:`, params);
    try {
      const response = await this.docClient.batchGet(params);
      return response.Responses as T;
    } catch (error) {
      this.logger.error(`${this.className}.batchGetItem error:`, error);
      throw error;
    }
  }

  static async transactWrite<T>(
    params: TransactWriteCommandInput
  ): Promise<T | undefined> {
    this.logger.debug(
      `${this.className}.transactWrite: Starting transaction:`,
      params
    );
    try {
      const response = await this.docClient.transactWrite(params);
      this.logger.debug(
        `${this.className}.transactWrite: Transaction completed successfully`
      );
      return response as T;
    } catch (error) {
      this.logger.error(`${this.className}.transactWrite error:`, error);
      throw error;
    }
  }
}
