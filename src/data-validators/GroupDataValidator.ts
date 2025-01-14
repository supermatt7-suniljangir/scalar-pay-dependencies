import { AuthenticatedRequest } from "../middleware/verify-token";
import { GROUP_TYPE, Member } from "../models/group.model";

/**
 * Class responsible for validating group-related data
 * @class GroupDataValidator
 */
export class GroupDataValidator {
  private static readonly NAME_MIN_LENGTH = 3;
  private static readonly NAME_MAX_LENGTH = 15;
  private static readonly TIP_AMOUNTS_MIN = 3;
  private static readonly TIP_AMOUNTS_MAX = 5;

  /**
   * Validates group name
   * @param name - The group name to validate
   * @returns Object containing validation result and error message if applicable
   */
  public validateGroupName(name: string): {
    isValid: boolean;
    message?: string;
  } {
    if (
      name.length <= GroupDataValidator.NAME_MIN_LENGTH ||
      name.length >= GroupDataValidator.NAME_MAX_LENGTH
    ) {
      return {
        isValid: false,
        message: "Group name must be between 3 and 15 characters",
      };
    }
    return { isValid: true };
  }

  /**
   * Validates tip amounts array
   * @param tipAmounts - Array of tip amounts to validate
   * @returns Object containing validation result and error message if applicable
   */
  public validateTipAmounts(tipAmounts: number[]): {
    isValid: boolean;
    message?: string;
  } {
    if (
      tipAmounts.length <= GroupDataValidator.TIP_AMOUNTS_MIN ||
      tipAmounts.length > GroupDataValidator.TIP_AMOUNTS_MAX
    ) {
      return {
        isValid: false,
        message: "Acceptable tip amounts must be between 3 and 6 numbers",
      };
    }
    return { isValid: true };
  }

  /**
   * Validates group type
   * @param type - The group type to validate
   * @returns Object containing validation result and error message if applicable
   */
  public validateGroupType(type: GROUP_TYPE): {
    isValid: boolean;
    message?: string;
  } {
    if (!Object.values(GROUP_TYPE).includes(type)) {
      return {
        isValid: false,
        message: "Invalid group type",
      };
    }
    return { isValid: true };
  }

  /**
   * Validates member updates ensuring admin privileges are maintained
   * @param members - Array of updated members
   * @param currentMembers - Array of current members
   * @param userId - ID of the user making the update
   * @returns Object containing validation result and error message if applicable
   */
  public validateMemberUpdates(
    members: Member[],
    currentMembers: Member[],
    userId: string
  ): {
    isValid: boolean;
    message?: string;
  } {
    // Find creator in current members
    const creator = currentMembers.find(member => member.is_creator);
    if (!creator) {
      return {
        isValid: false,
        message: "Group creator not found",
      };
    }

    // Validate creator remains admin
    if (
      !members.some(
        member => member.user_id === creator.user_id && member.is_admin
      )
    ) {
      return {
        isValid: false,
        message: "Group creator must remain an admin",
      };
    }

    // Validate current user remains admin
    if (!members.some(member => member.user_id === userId && member.is_admin)) {
      return {
        isValid: false,
        message: "You cannot remove yourself from being an admin",
      };
    }

    return { isValid: true };
  }
}
