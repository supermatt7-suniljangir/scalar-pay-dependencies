import { DynamoDBHelper } from ".";
import { config } from "../config/config";
import GroupInvite from "../models/group-invite.model";
import { createLogger } from "../utils/Logger";
import { PutCommandInput, GetCommandInput } from "@aws-sdk/lib-dynamodb";

const logger = createLogger("GroupInviteService");

export class GroupInviteServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "GroupInviteServiceError";
  }
}

export class GroupInviteService {
  private static readonly className = "GroupInviteService";
  private static readonly groupInviteTableName = config.GROUP_INVITE_TABLE_NAME;

  static async createGroupInvite(
    groupInvite: GroupInvite
  ): Promise<GroupInvite> {
    logger.debug(
      `${this.className}.createGroupInvite: Creating group invite with ID ${groupInvite.id}`
    );

    const params: PutCommandInput = {
      TableName: this.groupInviteTableName,
      Item: groupInvite,
    };

    try {
      await DynamoDBHelper.putItem(params);
      logger.info(
        `${this.className}.createGroupInvite: Successfully created group invite ${groupInvite.id}`,
        groupInvite
      );
      return groupInvite;
    } catch (error: any) {
      logger.error(`${this.className}.createGroupInvite error:`, error);
      throw new GroupInviteServiceError(
        "Failed to create group invite",
        "CREATE_GROUP_INVITE_FAILED"
      );
    }
  }

  static async getGroupInviteById(
    id: string
  ): Promise<GroupInvite | undefined> {
    logger.debug(
      `${this.className}.getGroupInviteById: Fetching group invite with ID ${id}`
    );

    const params: GetCommandInput = {
      TableName: this.groupInviteTableName,
      Key: { id },
    };

    try {
      const result = await DynamoDBHelper.getItem<GroupInvite>(
        params
      );

      if (!result) {
        return undefined;
      }

      const groupInvite = result;
      logger.info(
        `${this.className}.getGroupInviteById: Successfully retrieved group invite ${id}`,
        groupInvite
      );
      return groupInvite;
    } catch (error: any) {
      logger.error(`${this.className}.getGroupInviteById error:`, error);
      throw new GroupInviteServiceError(
        "Failed to fetch group invite",
        "GET_GROUP_INVITE_FAILED"
      );
    }
  }
}

export default GroupInviteService;
