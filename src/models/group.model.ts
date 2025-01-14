import { CountryCode } from "../types/country-code";

/**
 * Represents a group of users with various roles and settings.
 *
 * - The `members` field contains all users who are part of the group, including the creator and admins.
 * - The `creator` is always included in the `admins` list, meaning the creator has admin privileges.
 * - Admins have special permissions to manage the group, including updating settings and adding/removing members.
 * - The group can have a specific theme (`theme`) selected by the admins, which will be reflected in the UI.
 */
export interface Group {
  /**
   * Unique identifier for the group.
   */
  id: string;

  /**
   * The name of the group.
   */
  name: string;

  /**
   * The country code where the group is based, represented as a `CountryCode` enum.
   * Should be same as the country code of the creator.
   * This filed can't be updated once the group is created.
   */
  country: CountryCode;

  /**
   * List of members in the group.
   * Each member includes the user ID, and flags indicating if they are an admin, the creator, and if they can receive tips.
   */
  members: Member[];

  /**
   * List of acceptable tip amounts for the group, represented in the smallest currency unit (e.g., cents).
   *
   * - This field defines the specific amounts that members can receive as tips.
   * - The amounts are stored as integers to avoid floating-point precision issues.
   * - Example: [200, 400, 600, 700] represents 2.00, 4.00, 6.00, and 7.00 in the group's currency.
   */
  acceptable_tip_amounts: number[];

  /**
   * Specifies the type of group, defined by an enum.
   *
   * - `Individual_TIPS`: Tips are directed towards individual members.
   * - `Shared_TIPS`: Tips are pooled and shared among the group.
   * - `Charity`: The group operates for charitable purposes.
   */
  type: GROUP_TYPE;

  /**
   * Unix timestamp representing when the group was created.
   */
  created_at: number;

  /**
   * Unix timestamp representing when the group was last updated.
   */
  updated_at: number;
}
/**
 * Represents a member of a group with defined roles and permissions.
 *
 * - Each member has an email identifier and various boolean flags to determine their roles and permissions within the group.
 */
export interface Member {
  /**
   * The user id of user represented as uuid.
   *
   * - This serves as the unique identifier for the member within the group.
   * - The user_id is used to identify and manage members' roles and permissions.
   *
   * Example: "123-123-123-13123"
   */
  user_id: string;

  /**
   * Indicates whether this member is the creator of the group.
   *
   * - The creator has special privileges, typically including full administrative rights over the group.
   * - This flag should be `true` for only one member in the group, who is the original creator.
   * - A group creator is always an admin.
   *
   * Example: `true` if the member is the group creator.
   */
  is_creator: boolean;

  /**
   * Indicates whether this member has admin privileges.
   *
   * - Admins can manage the group, including adding/removing members, updating group settings, and handling administrative tasks.
   * - Admin privileges may be assigned to multiple members.
   * - The group creator is always considered an admin, but other members may also have admin privileges.
   *
   * Example: `true` if the member is an admin.
   */
  is_admin: boolean;

  /**
   * Indicates whether this member can receive tips.
   *
   * - This flag determines whether the member is eligible to receive monetary tips within the group.
   * - In some cases, only specific members (e.g., employees) are allowed to receive tips, while admins or creators may not be eligible.
   *
   * Example: `true` if the member can receive tips.
   */
  can_receive_tip: boolean;
}

export enum GROUP_TYPE {
  Individual_TIPS = "Individual_Tips",
  Shared_TIPS = "Shared_Tips",
  Charity = "Charity",
}
