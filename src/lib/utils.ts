import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Masks an email address for display purposes (privacy).
 * Shows first character, asterisks, and the domain.
 *
 * @param email - The email address to mask.
 * @returns Masked email (e.g., "j***n@example.com").
 *
 * @example
 * maskEmail('john@example.com') // "j***n@example.com"
 * maskEmail('a@test.com') // "a***@test.com"
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email; // Invalid email format, return as-is
  }

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];

  return `${firstChar}***${lastChar}@${domain}`;
}
