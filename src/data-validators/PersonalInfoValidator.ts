import { UpdatePersonalInfoRequest } from "../controllers/UserController";
import { CountryCode } from "../types/country-code";
import { Address, DateOfBirth } from "../types/user-types";
import { ValidationError, ValidationResult } from "./validation-types";

export class PersonalInfoValidator {
  private static NAME_MIN_LENGTH = 2;
  private static NAME_MAX_LENGTH = 20;
  private static POSTAL_CODE_MAX_LENGTH = 10;
  private static MIN_AGE_YEARS = 18;
  private static MAX_AGE_YEARS = 120;

  /**
   * Validates personal information fields with detailed constraints
   */
  static validatePersonalInfo(
    data: UpdatePersonalInfoRequest
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate first name
    if (!data.first_name) {
      errors.push({
        field: "first_name",
        message: "First name is required",
      });
    } else if (!this.isValidName(data.first_name)) {
      errors.push({
        field: "first_name",
        message: `First name must be between ${this.NAME_MIN_LENGTH} and ${this.NAME_MAX_LENGTH} characters and contain only letters, spaces, hyphens, and apostrophes`,
      });
    }

    // Validate last name
    if (!data.last_name) {
      errors.push({
        field: "last_name",
        message: "Last name is required",
      });
    } else if (!this.isValidName(data.last_name)) {
      errors.push({
        field: "last_name",
        message: `Last name must be between ${this.NAME_MIN_LENGTH} and ${this.NAME_MAX_LENGTH} characters and contain only letters, spaces, hyphens, and apostrophes`,
      });
    }

    // Validate DOB
    if (!data.dob) {
      errors.push({ field: "dob", message: "Date of birth is required" });
    } else {
      const dobErrors = this.validateDateOfBirth(data.dob);
      errors.push(...dobErrors);
    }

    // Validate address
    if (!data.address) {
      errors.push({ field: "address", message: "Address is required" });
    } else {
      const addressErrors = this.validateAddress(data.address);
      errors.push(...addressErrors);
    }

    // Validate mobile
    if (!data.mobile) {
      errors.push({
        field: "mobile",
        message: "Mobile number is required",
      });
    } else if (!this.isValidMobileNumber(data.mobile)) {
      errors.push({
        field: "mobile",
        message:
          "Invalid mobile number format. Must include country code (e.g., +1-555-123-4567)",
      });
    }

    // Validate country
    if (!data.country) {
      errors.push({ field: "country", message: "Country is required" });
    } else if (!this.isValidCountryCode(data.country)) {
      errors.push({
        field: "country",
        message: "Invalid country code",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates name format and length
   */
  private static isValidName(name: string): boolean {
    const nameRegex = /^[A-Za-zÀ-ÿ\-' ]+$/;
    const trimmedName = name.trim();
    return (
      trimmedName.length >= this.NAME_MIN_LENGTH &&
      trimmedName.length <= this.NAME_MAX_LENGTH &&
      nameRegex.test(trimmedName)
    );
  }

  /**
   * Validates mobile number format
   */
  private static isValidMobileNumber(mobile: string): boolean {
    // Matches format: +{country-code}-{number} e.g., +1-555-123-4567
    const mobileRegex = /^\+[1-9]\d{0,2}[-\s]?\d{1,14}$/;
    return mobileRegex.test(mobile);
  }

  /**
   * Validates date of birth
   */
  private static validateDateOfBirth(dob: DateOfBirth): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!dob.day || !dob.month || !dob.year) {
      errors.push({
        field: "dob",
        message: "Complete date of birth is required",
      });
      return errors;
    }

    // Validate date format and existence
    const date = new Date(dob.year, dob.month - 1, dob.day);
    if (
      date.getFullYear() !== dob.year ||
      date.getMonth() !== dob.month - 1 ||
      date.getDate() !== dob.day
    ) {
      errors.push({ field: "dob", message: "Invalid date of birth" });
      return errors;
    }

    // Calculate age
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
        ? age - 1
        : age;

    // Validate age constraints
    if (actualAge < this.MIN_AGE_YEARS) {
      errors.push({
        field: "dob",
        message: `Must be at least ${this.MIN_AGE_YEARS} years old`,
      });
    }
    if (actualAge > this.MAX_AGE_YEARS) {
      errors.push({
        field: "dob",
        message: `Age cannot exceed ${this.MAX_AGE_YEARS} years`,
      });
    }

    return errors;
  }

  /**
   * Validates address fields
   */
  private static validateAddress(address: Address): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!address.line1?.trim()) {
      errors.push({
        field: "address.line1",
        message: "Street address is required",
      });
    }

    if (!address.city?.trim()) {
      errors.push({ field: "address.city", message: "City is required" });
    }

    if (!address.state?.trim()) {
      errors.push({
        field: "address.state",
        message: "State is required",
      });
    }

    if (!address.postal_code?.trim()) {
      errors.push({
        field: "address.postal_code",
        message: "Postal code is required",
      });
    } else if (address.postal_code.length > this.POSTAL_CODE_MAX_LENGTH) {
      errors.push({
        field: "address.postal_code",
        message: `Postal code cannot exceed ${this.POSTAL_CODE_MAX_LENGTH} characters`,
      });
    }

    if (!address.country?.trim()) {
      errors.push({
        field: "address.country",
        message: "Country is required",
      });
    } else if (!this.isValidCountryCode(address.country)) {
      errors.push({
        field: "address.country",
        message: "Invalid country code in address",
      });
    }

    return errors;
  }

  /**
   * Validates country code against CountryCode enum
   */
  private static isValidCountryCode(country: string): boolean {
    return Object.values(CountryCode).includes(country as CountryCode);
  }
}
