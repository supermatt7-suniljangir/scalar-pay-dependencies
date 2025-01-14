import { DynamoDBHelper } from ".";
import { config } from "../config/config";
import { Group, Member } from "../models/group.model";
import { createLogger } from "../utils/Logger";
import {
  PutCommandInput,
  GetCommandInput,
  UpdateCommandInput,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";

const logger = createLogger("GroupService");

export class GroupServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "GroupServiceError";
  }
}

class GroupService {
  private static readonly className = "GroupService";
  private static readonly groupTableName = config.GROUP_TABLE_NAME;
  private static readonly userTableName = config.USER_TABLE_NAME;

  private static getTimestamp(): number {
    return Date.now();
  }

  static async getGroupById(id: string): Promise<Group | undefined> {
    logger.debug(
      `${this.className}.getGroupById: Fetching group with ID ${id}`
    );

    const params: GetCommandInput = {
      TableName: this.groupTableName,
      Key: { id },
    };

    try {
      const result = await DynamoDBHelper.getItem<Group>(params);

      if (!result) {
        return undefined;
      }

      const group = result;
      logger.info(
        `${this.className}.getGroupById: Successfully retrieved group ${id}`,
        group
      );
      return group;
    } catch (error: any) {
      logger.error(`${this.className}.getGroupById error:`, error);
      throw new GroupServiceError("Failed to fetch group", "GET_GROUP_FAILED");
    }
  }
  static async createGroup(
    group: Group,
    userId: string,
  ): Promise<Group> {
    logger.debug(
      `${this.className}.createGroup: Creating group with ID ${group.id}`
    );

    const params: TransactWriteCommandInput = {
      TransactItems: [
        {
          Put: {
            TableName: this.groupTableName,
            Item:group,
            ConditionExpression: "attribute_not_exists(id)",
          },
        },
        {
          Update: {
            TableName: this.userTableName,
            Key: { id: userId },
            UpdateExpression:
              "SET #groups = list_append(if_not_exists(#groups, :empty_list), :newGroup), updated_at = :timestamp",
            ExpressionAttributeNames: {
              "#groups": "groups",
            },
            ExpressionAttributeValues: {
              ":newGroup": [group.id],
              ":empty_list": [],  
              ":timestamp": this.getTimestamp(),
            },
          },
        },
      ],
    };

    try {
      // instead of only creating the group, we also need to update the user table to add the group to the user's groups list, a transaction is needed
      await DynamoDBHelper.transactWrite(params);
      logger.info(
        `${this.className}.createGroup: Successfully created group ${group.id}`,
        group
      );
      return group;
    } catch (error: any) {
      logger.error(`${this.className}.createGroup error:`, error);
      throw new GroupServiceError(
        "Failed to create group",
        "CREATE_GROUP_FAILED"
      );
    }
  }

  static async updateGroup(group: Group): Promise<Group> {
    logger.debug(
      `${this.className}.updateGroup: Updating group with ID ${group.id}`
    );

    const params: UpdateCommandInput = {
      TableName: this.groupTableName,
      Key: { id: group.id },
      UpdateExpression:
        "set #name = :name, #members = :members, #acceptable_tip_amounts = :acceptable_tip_amounts",
      ExpressionAttributeNames: {
        "#name": "name",
        "#members": "members",
        "#acceptable_tip_amounts": "acceptable_tip_amounts",
      },
      ExpressionAttributeValues: {
        ":name": group.name,
        ":members": group.members,
        ":acceptable_tip_amounts": group.acceptable_tip_amounts,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await DynamoDBHelper.updateItem<{ Attributes: Group }>(
        params
      );

      if (!result || !result.Attributes) {
        throw new GroupServiceError(
          "Failed to update group",
          "UPDATE_GROUP_FAILED"
        );
      }

      const updatedGroup = result.Attributes;
      logger.info(
        `${this.className}.updateGroup: Successfully updated group ${group.id}`,
        updatedGroup
      );
      return updatedGroup;
    } catch (error: any) {
      logger.error(`${this.className}.updateGroup error:`, error);
      throw new GroupServiceError(
        "Failed to update group",
        "UPDATE_GROUP_FAILED"
      );
    }
  }

  static async addUserToGroup(
    groupId: string,
    member: Member,
    userId: string
  ): Promise<void> {
    logger.debug(
      `${this.className}.addUserToGroup: Adding member ${member.user_id} to group ${groupId}`
    );

    const params: TransactWriteCommandInput = {
      TransactItems: [
        {
          Update: {
            TableName: this.groupTableName,
            Key: { id: groupId },
            UpdateExpression:
              "SET #members = list_append(if_not_exists(#members, :empty_list), :user)",
            ExpressionAttributeNames: {
              "#members": "members",
            },
            ExpressionAttributeValues: {
              ":user": [member],
              ":empty_list": [],
            },
          },
        },
        {
          Update: {
            TableName: this.userTableName,
            Key: { id: userId },
            UpdateExpression:
              "SET #groups = list_append(if_not_exists(#groups, :empty_list), :groupId), updated_at = :timestamp",
            ExpressionAttributeNames: {
              "#groups": "groups",
            },
            ExpressionAttributeValues: {
              ":groupId": [groupId],
              ":empty_list": [],
              ":timestamp": this.getTimestamp(),
            },
          },
        },
      ],
    };

    try {
      await DynamoDBHelper.transactWrite(params);
      logger.info(
        `${this.className}.addUserToGroup: Successfully added user ${member.user_id} to group ${groupId}`
      );
    } catch (error: any) {
      logger.error(`${this.className}.addUserToGroup error:`, error);
      throw new GroupServiceError(
        "Failed to add user to group",
        "ADD_USER_TO_GROUP_FAILED"
      );
    }
  }
}

export default GroupService;
