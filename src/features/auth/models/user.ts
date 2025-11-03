import bcrypt from 'bcryptjs';

import { BCRYPT_SALT_ROUNDS } from '@/features/auth/lib/config';

import type { User as PrismaUser } from '@prisma/client';

/**
 * User domain model representing a registered user entity.
 *
 * This class encapsulates user-related business logic including password management,
 * email verification state, and role-based permissions. It wraps the Prisma User
 * entity and provides a clean API for common user operations.
 *
 * @remarks
 * This model should be used by services and actions to work with user data.
 * It provides type-safe access to user properties and domain-specific methods.
 */
export class User {
  private readonly data: PrismaUser;

  constructor(data: PrismaUser) {
    this.data = data;
  }

  /**
   * Get the user's unique identifier.
   */
  get id(): string {
    return this.data.id;
  }

  /**
   * Get the user's email address.
   */
  get email(): string {
    return this.data.email;
  }

  /**
   * Get the user's name.
   */
  get name(): string | null {
    return this.data.name;
  }

  /**
   * Get the user's role.
   */
  get role(): string {
    return this.data.role;
  }

  /**
   * Get the user's email verification timestamp.
   */
  get emailVerified(): Date | null {
    return this.data.emailVerified;
  }

  /**
   * Get the user's profile image URL.
   */
  get image(): string | null {
    return this.data.image;
  }

  /**
   * Get the timestamp when the user was created.
   */
  get createdAt(): Date {
    return this.data.createdAt;
  }

  /**
   * Get the timestamp when the user was last updated.
   */
  get updatedAt(): Date {
    return this.data.updatedAt;
  }

  /**
   * Check if the user's email address has been verified.
   *
   * @returns True if emailVerified timestamp exists, false otherwise.
   */
  isEmailVerified(): boolean {
    return this.data.emailVerified !== null;
  }

  /**
   * Check if the user has a specific role.
   *
   * @param role - The role to check for.
   * @returns True if the user has the specified role.
   */
  hasRole(role: string): boolean {
    return this.data.role === role;
  }

  /**
   * Verify a plain text password against the stored hashed password.
   *
   * @param plainPassword - The plain text password to verify.
   * @returns Promise resolving to true if password matches, false otherwise.
   *
   * @remarks
   * Uses bcrypt for secure password comparison. This is a CPU-intensive operation.
   * Returns false if the user has no password set (e.g., OAuth-only accounts).
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    // OAuth users may not have a password
    if (!this.data.password) {
      return false;
    }

    return await bcrypt.compare(plainPassword, this.data.password);
  }

  /**
   * Get the user data without the password field.
   *
   * @returns User data with password omitted.
   *
   * @remarks
   * Use this method when returning user data to clients or logs.
   */
  toSafeObject(): Omit<PrismaUser, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = this.data;
    return userWithoutPassword;
  }

  /**
   * Get the raw Prisma user data.
   *
   * @returns The underlying Prisma User object.
   *
   * @remarks
   * Use sparingly - prefer domain methods over direct data access.
   */
  toPrisma(): PrismaUser {
    return this.data;
  }

  /**
   * Hash a plain text password using bcrypt.
   *
   * @param plainPassword - The plain text password to hash.
   * @returns Promise resolving to the hashed password.
   *
   * @remarks
   * Static method for use during user creation before a User instance exists.
   * Uses BCRYPT_SALT_ROUNDS from auth constants.
   */
  static async hashPassword(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Validate password strength.
   *
   * @param password - The password to validate.
   * @returns True if password meets minimum requirements.
   *
   * @remarks
   * Current requirements: At least 6 characters (enforced by Zod schema).
   * This method provides a central place for future password policy enforcement.
   */
  static isValidPassword(password: string): boolean {
    const MIN_PASSWORD_LENGTH = 6;
    return password.length >= MIN_PASSWORD_LENGTH;
  }

  /**
   * Validate email format.
   *
   * @param email - The email address to validate.
   * @returns True if email format is valid.
   *
   * @remarks
   * Basic email validation. Full validation happens in Zod schemas.
   * This method provides a central place for future email policy enforcement.
   */
  static isValidEmail(email: string): boolean {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return EMAIL_REGEX.test(email);
  }
}
