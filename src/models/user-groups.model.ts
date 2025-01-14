/**
 * Represents a many-to-many (M:M) relationship between users and groups in DynamoDB.
 *
 * This interface implements a dual-access pattern to efficiently query the relationship
 * from both the user's and group's perspective:
 *
 * User perspective item example:
 * {
 *   pk: "USER#123-456",
 *   sk: "GROUP#789-012",
 *   is_creator: true,
 *   is_admin: true,
 *   can_receive_tip: false
 * }
 *
 * Group perspective item example:
 * {
 *   pk: "GROUP#789-012",
 *   sk: "USER#123-456",
 *   is_creator: true,
 *   is_admin: true,
 *   can_receive_tip: false
 * }
 *
 * Common Query Patterns:
 * - Get all groups for a user: Query where pk = "USER#<user-id>"
 * - Get all users in a group: Query where pk = "GROUP#<group-id>"
 * - Check specific user-group relationship: Get item with pk = "USER#<user-id>" and sk = "GROUP#<group-id>"
 *   or pk = "GROUP#<group-id>" and sk = "USER#<user-id>"
 */

export interface UserGroups {
  /**
   * Partition key for the DynamoDB table.
   *
   * Format:
   * - For user perspective: "USER#<uuid>"
   * - For group perspective: "GROUP#<uuid>"
   *
   * This field enables efficient queries for:
   * - All groups a user belongs to (when prefixed with USER#)
   * - All users in a group (when prefixed with GROUP#)
   *
   * @example "USER#123-456-789" or "GROUP#789-012-345"
   */
  pk: string;

  /**
   * Sort key for the DynamoDB table.
   *
   * Format:
   * - For user perspective: "GROUP#<uuid>"
   * - For group perspective: "USER#<uuid>"
   *
   * This field enables:
   * - Efficient range queries
   * - Sorting of query results
   * - Unique identification of each relationship
   *
   * @example "GROUP#789-012-345" or "USER#123-456-789"
   */
  sk: string;

  /**
   * Indicates whether this member is the creator of the group.
   *
   * Business Rules:
   * - Only one member per group can have is_creator = true
   * - Creator status cannot be transferred to another member
   * - Creator automatically has admin privileges
   * - Creator status persists until group deletion
   *
   * Access Pattern:
   * - Used in condition expressions for group management operations
   * - Part of authorization checks for administrative actions
   *
   * @example true // Indicates this member created the group
   */
  is_creator: boolean;

  /**
   * Indicates whether this member has administrative privileges.
   *
   * Business Rules:
   * - Multiple members can have admin status
   * - Group creator is always an admin (can't be removed)
   * - Admins can grant/revoke admin status to other members
   * - Last admin cannot remove their admin status
   *
   * Access Pattern:
   * - Checked during authorization for management operations
   * - Used in condition expressions for admin-only actions
   *
   * @example true // Indicates this member has admin privileges
   */
  is_admin: boolean;

  /**
   * Determines if the member can receive monetary tips within the group.
   *
   * Business Rules:
   * - Can be modified by group admins
   * - Independent of admin/creator status
   * - May be restricted based on group type or settings
   * - May be affected by user's profile settings or verification status
   *
   * Access Pattern:
   * - Queried during tip processing
   * - Used in filters for displaying eligible tip recipients
   * - Checked in condition expressions for tip transactions
   *
   * @example true // Indicates this member can receive tips
   */
  can_receive_tip: boolean;

  /**
   * Unix epoch timestamp (in seconds) of when the relationship was created.
   *
   * Used for:
   * - Auditing
   * - Sorting members by join date
   * - Analytics
   *
   * @example 1704801600 // Represents 2024-01-09 12:00:00 UTC
   */
  created_at: number;

  /**
   * Unix epoch timestamp (in seconds) of the last modification to this relationship.
   *
   * Updated when:
   * - Admin status changes
   * - Tip receiving status changes
   * - Any other relationship attributes are modified
   *
   * @example 1704814200 // Represents 2024-01-09 15:30:00 UTC
   */
  updated_at: number;
}

/**
 * Constants for DynamoDB key prefixes
 */
export const USER_GROUP_PREFIXES = {
  USER: "USER#",
  GROUP: "GROUP#",
} as const;

/**
 * Helper functions for working with UserGroups keys
 */
export const UserGroupsHelper = {
  /**
   * Creates a partition key for user perspective
   */
  createUserKey: (userId: string): string =>
    `${USER_GROUP_PREFIXES.USER}${userId}`,

  /**
   * Creates a partition key for group perspective
   */
  createGroupKey: (groupId: string): string =>
    `${USER_GROUP_PREFIXES.GROUP}${groupId}`,
};
