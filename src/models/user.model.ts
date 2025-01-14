import { ScalarTagId } from "../types/scalary-tags";
import { CountryCode } from "../types/country-code";
import {
  ACCOUNT_STATUS,
  Address,
  DateOfBirth,
  PROFILE_PENDING_INFO,
  PROFILE_STATUS,
  USER_ROLE,
} from "../types/user-types";

/**
 * Represents a user in the system with personal details, role, status information.
 */
export interface User {
  /**
   * A unique identifier for the user, stored as a UUID (Universally Unique Identifier).
   */
  id: string;

  /**
   * The user's unique email address, which serves as the primary identifier in the system.
   *
   * Example: "john.doe@example.com"
   */
  email: string;

  /**
   * The user's first name.
   *
   * Example: "John"
   */
  first_name: string;

  /**
   * The user's last name.
   *
   * Example: "Doe"
   */
  last_name: string;

  /**
   * The user's date of birth information.
   */
  dob?: DateOfBirth;

  /**
   * The user's physical address information.
   */
  address?: Address;

  /**
   * URL to the user's profile picture.
   *
   * - This URL points to an image resource that can be used to display the user's profile picture in the UI.
   * - If the user hasn't uploaded a picture, this field may point to a default avatar or placeholder image.
   *
   * Example: "https://example.com/profiles/john.jpg"
   */
  picture_url: string;

  /**
   * The user's mobile phone number, including country code.
   *
   * - This is a string to accommodate international formats and special characters (e.g., "+", "-", spaces).
   *
   * Example: "+1-555-123-4567"
   */
  mobile?: string;

  /**
   * The user's country of residence, represented by a `CountryCode` enum.
   *
   * - This should follow the ISO 3166-1 standard for country codes (e.g., "US" for the United States, "IN" for India).
   */
  country?: CountryCode;

  /**
   * The role assigned to the user, represented by a `USER_ROLE` enum.
   *
   * - Common roles might include "employee", "admin", "manager", etc.
   * - The role defines the user's access level and permissions within the system.
   */
  role: USER_ROLE;

  /**
   * The current status of the user's profile, represented by a `PROFILE_STATUS` enum.
   *
   * - This field tracks whether the user's profile is complete or if more information is required.
   * - For example, the profile state could indicate whether personal or bank details are still missing.
   */
  profile_status: PROFILE_STATUS;

  /**
   * Specific information pending in an incomplete profile, represented by a `PROFILE_PENDING_INFO` enum.
   */
  profile_pending_info: PROFILE_PENDING_INFO[];

  /**
   * This represents Scalar tags user has achieved so far.
   */
  scalar_tag: ScalarTagId[];

  /**
   * The current status of the user account, represented by the `AccountStatus` enum.
   *
   * - Possible values are `account-on-hold` or `active`.
   */
  account_status: ACCOUNT_STATUS;

  /**
   * The user's Stripe Connect account ID.
   *
   * - This ID is used to link the user's account with Stripe for payment processing.
   * - It is a unique identifier provided by Stripe when the user registers for a Connect account.
   *
   * Example: "acct_1Gqj58HY0qyl6XeW"
   */
  stripe_account_id?: string;

  /**
   * Indicates whether the Stripe account connected to this user is verified.
   *
   * - This field is a boolean value that shows if the user's Stripe account has been successfully verified.
   * - Verification is typically required for processing payments and ensuring compliance with Stripe's policies.
   *
   * Example: true
   */
  is_stripe_account_verified?: boolean;

  /**
   * Indicates whether the user's Stripe account information should be updated.
   *
   * - This field is used to trigger updates to the user's Stripe account information when necessary.
   * - For example, if the user's bank details have changed, this flag can be set to true to indicate that the Stripe account should be updated.
   *
   * Example: true
   */
  should_update_stripe_account: boolean;

  /**
   * The IP address of the user at the time of account creation.
   *
   * - This field stores the IP address from which the user registered their account.
   * - It can be used for security and auditing purposes.
   *
   * Example: "192.168.1.1"
   */
  registration_ip: string;

  /**
   * An array of group UUIDs that the user is part of.
   *
   * - This field stores the unique identifiers of the groups to which the user belongs.
   * - It helps in managing group memberships and permissions.
   *
   * Example: ["group-uuid-1", "group-uuid-2"]
   */
  groups: string[];

  /**
   * Unix timestamp (in seconds) representing when the user account was created.
   *
   * - This is typically set when the user first registers or is added to the system.
   *
   * Example: 1632150400
   */
  created_at: number;

  /**
   * Unix timestamp (in seconds) representing the last time the user's profile or account was updated.
   *
   * - This includes changes to personal information, role updates, or profile state changes.
   *
   * Example: 1632150400
   */
  updated_at: number;
}
