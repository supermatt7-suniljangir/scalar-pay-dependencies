import { CountryCode } from "./country-code";

/**
 * Enum to represent the account status of the user.
 */
export enum ACCOUNT_STATUS {
  SUSPENDED = "account-suspended",
  ACTIVE = "active",
}

/**
 * Enum representing the different roles a user can have in the system.
 *
 * Each role defines a user's access level, permissions, and responsibilities within the application.
 */
export enum USER_ROLE {
  /**
   * `CUSTOMER`: Represents a standard customer in the system.
   *
   * - Typically, a customer has basic access to the system and limited permissions.
   * - They can view and interact with content relevant to their role but do not have administrative or management capabilities.
   *
   */
  CUSTOMER = "customer",

  /**
   * `PROMOTER`: Represents a user with promotional or marketing responsibilities.
   *
   * - Promoters may have access to marketing or promotional tools and can manage related activities.
   * - This role may have some elevated permissions compared to an employee, specifically in promotional content creation or distribution.
   *
   */
  PROMOTER = "promoter",

  /**
   * `ADMIN`: Represents a user with full administrative privileges.
   *
   * - Admins have the highest level of access in the system, allowing them to manage users, settings, and overall operations.
   * - They can create, modify, and delete content, manage user roles, and make system-wide changes.
   *
   */
  ADMIN = "admin",
}

/**
 * Represents the overall completion status of a user's profile
 */
export enum PROFILE_STATUS {
  INCOMPLETE = "incomplete",
  COMPLETE = "complete",
}

/**
 * Represents which specific information is pending in an incomplete profile
 */
export enum PROFILE_PENDING_INFO {
  PERSONAL_INFO = "require-personal-info",
  BANK_INFO = "require-bank-info",
  KYC_INFO = "require-kyc-info",
  NONE = "none", // Used when profile is complete
}

/**
 * Represents a physical address with detailed location information.
 */
export interface Address {
  /**
   * First line of the address (street address, apartment number, etc.).
   *
   * Example: "123 Main Street, Apt 4B"
   */
  line1: string;

  /**
   * Optional second line of the address for additional details.
   *
   * Example: "Building C, Floor 3"
   */
  line2?: string;

  /**
   * Name of the city.
   *
   * Example: "San Francisco"
   */
  city: string;

  /**
   * State, province, or region.
   *
   * Example: "California"
   */
  state: string;

  /**
   * Postal or ZIP code.
   *
   * Example: "94105"
   */
  postal_code: string;

  /**
   * Country code following ISO 3166-1 standard.
   */
  country: CountryCode;
}

/**
 * Represents a date of birth with separate fields for month, day, and year.
 */
export interface DateOfBirth {
  /**
   * Month of birth (1-12).
   */
  month: number;

  /**
   * Day of birth (1-31).
   */
  day: number;

  /**
   * Year of birth (four-digit format).
   *
   * Example: 1990
   */
  year: number;
}
