import { DynamoDBHelper } from ".";
import { config } from "../config/config";
import { User } from "../models/user.model";
import { createLogger } from "../utils/Logger";
import {
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput,
  BatchGetCommand,
  BatchGetCommandInput,
} from "@aws-sdk/lib-dynamodb";
import GroupService from "./GroupService";

const logger = createLogger("UserService");

class UserServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}

class UserService {
  private static readonly className = "UserService";
  private static readonly userTableName = config.USER_TABLE_NAME;
  private static readonly groupTableName = config.GROUP_TABLE_NAME;
  private static readonly userTableIndexNameForEmail =
    config.USER_TABLE_INDEX_NAME_FOR_EMAIL;

  private static getTimestamp(): number {
    return Date.now();
  }

  static async createUser(user: User): Promise<void> {
    logger.debug(
      `${this.className}.createUser: Creating user with ID ${user.id}`
    );

    const params: PutCommandInput = {
      TableName: this.userTableName,
      Item: {
        ...user,
        created_at: this.getTimestamp(),
        updated_at: this.getTimestamp(),
      },
      ConditionExpression: "attribute_not_exists(id)",
    };
    logger.debug(`${this.className}.createUser: Sending request to DDB:`, {
      params,
    });

    try {
      await DynamoDBHelper.putItem(params);
      logger.info(
        `${this.className}.createUser: Successfully created user ${user.id}`
      );
    } catch (error: any) {
      logger.error(`${this.className}.createUser error:`, error);

      if (error.name === "ConditionalCheckFailedException") {
        throw new UserServiceError(
          "User already exists",
          "USER_ALREADY_EXISTS"
        );
      }
      throw new UserServiceError("Failed to create user", "CREATE_USER_FAILED");
    }
  }

  static async getUserWithGroups(userId: string): Promise<any> {
    try {
      // Fetch the user from the userTable using the userId
      const user = await this.getUserById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // If user has no groups, return just the user data
      if (!user.groups || user.groups.length === 0) {
        return { user, groups: [] };
      }

      // Fetch the groups based on the user's groups array (group IDs)
      const groupIds = user.groups;

      // Prepare batchGet request for groups with projection
      const batchParams: BatchGetCommandInput = {
        RequestItems: {
          [this.groupTableName]: {
            Keys: groupIds.map(id => ({ id })),
            // Add ProjectionExpression to fetch only specific attributes
            ProjectionExpression: "id, #name, #country",
            // Define ExpressionAttributeNames to handle reserved words
            ExpressionAttributeNames: {
              "#name": "name",
              "#country": "country",
            },
          },
        },
      };

      // Use batchGetItem to fetch all the groups at once
      const groupResponse = (await DynamoDBHelper.batchGetItem(
        batchParams
      )) as any;

      // Extract groups from the response
      const groups = groupResponse[this.groupTableName] || [];

      return { user, groups };
    } catch (error) {
      logger.error("Error fetching user with groups:", error);
      throw new Error("Failed to fetch user with groups");
    }
  }

  static async updateUserPersonalInfo(user: User): Promise<void> {
    logger.debug(
      `${this.className}.updateUser: Updating user with ID ${user.id}`
    );

    const {
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames,
    } = this.buildUpdateExpression({
      first_name: user.first_name,
      last_name: user.last_name,
      dob: user.dob,
      address: user.address,
      mobile: user.mobile,
      country: user.country,
      should_update_stripe_account: user.should_update_stripe_account,
      profile_pending_info: user.profile_pending_info,
      profile_status: user.profile_status,
      updated_at: this.getTimestamp(),
    });

    const params = {
      TableName: this.userTableName,
      Key: {
        id: user.id,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ConditionExpression: "attribute_exists(id)",
    };

    logger.debug(`${this.className}.updateUser: Sending request to DDB:`, {
      params,
    });

    try {
      await DynamoDBHelper.updateItem(params);
      logger.info(
        `${this.className}.updateUser: Successfully updated user ${user.id}`
      );
    } catch (error: any) {
      logger.error(`${this.className}.updateUser error:`, error);

      if (error.name === "ConditionalCheckFailedException") {
        throw new UserServiceError("User does not exist", "USER_NOT_FOUND");
      }
      throw new UserServiceError("Failed to update user", "UPDATE_USER_FAILED");
    }
  }

  static async joinGroup(userId: string, groupId: string): Promise<void> {
    logger.debug(
      `${this.className}.joinGroup: Adding group ${groupId} to user ${userId}`
    );

    const params = {
      TableName: this.userTableName,
      Key: {
        id: userId,
      },
      UpdateExpression:
        "SET groups = list_append(if_not_exists(groups, :emptyList), :groupId), updated_at = :updatedAt",
      ExpressionAttributeValues: {
        ":groupId": [groupId],
        ":updatedAt": this.getTimestamp(),
        ":emptyList": [],
      },
      ConditionExpression: "attribute_exists(id)",
    };

    logger.debug(`${this.className}.joinGroup: Sending request to DDB:`, {
      params,
    });

    try {
      await DynamoDBHelper.updateItem(params);
      logger.info(
        `${this.className}.joinGroup: Successfully added group ${groupId} to user ${userId}`
      );
    } catch (error: any) {
      logger.error(`${this.className}.joinGroup error:`, error);

      if (error.name === "ConditionalCheckFailedException") {
        throw new UserServiceError("User does not exist", "USER_NOT_FOUND");
      }
      throw new UserServiceError(
        "Failed to add user to group",
        "JOIN_GROUP_FAILED"
      );
    }
  }

  /**
   * Builds DynamoDB update expression for user fields
   */
  private static buildUpdateExpression(updates: Partial<User>): {
    updateExpression: string;
    expressionAttributeValues: Record<string, any>;
    expressionAttributeNames: Record<string, string>;
  } {
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};
    const updateParts: string[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const attributeKey = `#${key}`;
        const valueKey = `:${key}`;

        expressionAttributeNames[attributeKey] = key;
        expressionAttributeValues[valueKey] = value;
        updateParts.push(`${attributeKey} = ${valueKey}`);
      }
    });

    return {
      updateExpression: `SET ${updateParts.join(", ")}`,
      expressionAttributeValues,
      expressionAttributeNames,
    };
  }

  static async getUserById(id: string): Promise<User | undefined> {
    logger.debug(`${this.className}.getUserById: Fetching user with ID ${id}`);

    const params: GetCommandInput = {
      TableName: this.userTableName,
      Key: {
        id: id,
      },
    };

    try {
      const result = await DynamoDBHelper.getItem<User>(params);

      let user;
      if (!result) {
        logger.debug("User not found for id:", id);
        return user;
      }
      user = result;

      logger.info(
        `${this.className}.getUserById: Successfully retrieved user ${id}`,
        user
      );
      return user;
    } catch (error: any) {
      logger.error(`${this.className}.getUserById error:`, error);

      throw new UserServiceError("Failed to fetch user", "GET_USER_FAILED");
    }
  }

  static async getUsersForGroup(ids: string[]): Promise<Partial<User>[]> {
    logger.debug(
      `${this.className}.getUsersForGroup: Fetching users with IDs`,
      ids
    );

    const keys = ids.map(id => ({ id }));
    const params: BatchGetCommandInput = {
      RequestItems: {
        [this.userTableName]: {
          Keys: keys,
          ProjectionExpression: "picture_url, first_name, last_name",
        },
      },
    };

    try {
      const result = await DynamoDBHelper.batchGetItem(params);
      const users =
        (result as { Responses: { [key: string]: Partial<User>[] } })
          .Responses?.[this.userTableName] || [];
      logger.info(
        `${this.className}.getUsersForGroup: Successfully retrieved users`,
        users
      );
      if (users.length !== ids.length) {
        const fetchedIds: string[] = users.map(
          (user: Partial<User>) => user.id as string
        );
        const missingIds = ids.filter(id => !fetchedIds.includes(id));
        logger.error(
          `${this.className}.getUsersForGroup: Some users were not found`,
          { missingIds }
        );
      }
      return users;
    } catch (error: any) {
      logger.error(`${this.className}.getUsersForGroup error:`, error);
      throw new UserServiceError(
        "Failed to fetch users",
        "GET_USERS_FOR_GROUP_FAILED"
      );
    }
  }

  static async getUserByEmail(email: string): Promise<User | undefined> {
    const params: QueryCommandInput = {
      TableName: this.userTableName,
      IndexName: this.userTableIndexNameForEmail,
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
    };
    logger.debug("Sending request to DDB: ", { params });

    try {
      return await DynamoDBHelper.queryItems<User>(params);
    } catch (error) {
      logger.error("Failed to query user by email:", error, { email });
      throw error;
    }
  }
  static async linkStripeConnectAccount(
    userId: string,
    connectAccountId: string
  ): Promise<void> {
    logger.debug(
      `${this.className}.linkStripeConnectAccount: Linking Stripe Connect account ${connectAccountId} to user ${userId}`
    );

    const params = {
      TableName: this.userTableName,
      Key: {
        id: userId,
      },
      UpdateExpression:
        "SET stripe_connect_account_id = :connectAccountId, updated_at = :updatedAt",
      ExpressionAttributeValues: {
        ":connectAccountId": connectAccountId,
        ":updatedAt": this.getTimestamp(),
      },
      ConditionExpression: "attribute_exists(id)",
    };
    logger.debug(
      `${this.className}.linkStripeConnectAccount: Sending request to DDB:`,
      { params }
    );

    try {
      await DynamoDBHelper.updateItem(params);
      logger.info(
        `${this.className}.linkStripeConnectAccount: Successfully linked Stripe Connect account to user ${userId}`
      );
    } catch (error: any) {
      logger.error(`${this.className}.linkStripeConnectAccount error:`, error);

      if (error.name === "ConditionalCheckFailedException") {
        throw new UserServiceError("User does not exist", "USER_NOT_FOUND");
      }
      throw new UserServiceError(
        "Failed to link Stripe Connect account",
        "LINK_STRIPE_ACCOUNT_FAILED"
      );
    }
  }
}

export default UserService;
