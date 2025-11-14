import { type useTranslations } from 'next-intl';
import { type FieldError } from 'react-hook-form';

type ErrorInput = string | FieldError | null | undefined;

/**
 * Translates one or more field errors using next-intl.
 * Falls back to the raw message if no translation is found.
 * Uses flatMap to simplify the map/filter process.
 *
 * @param t Translation function from useTranslations()
 * @param errors Single error or array of errors
 * @returns Array of translated error messages
 */
export const translateFieldErrors = (
  t: ReturnType<typeof useTranslations>,
  errors?: ErrorInput | ErrorInput[]
): Array<{ message: string }> => {
  if (!errors) return [];

  // Normalize input to an array
  const arr = Array.isArray(errors) ? errors : [errors];

  // Use flatMap to map values and filter out empty ones simultaneously
  return arr.flatMap(err => {
    // Get the raw message string
    const message =
      typeof err === 'string'
        ? err
        : typeof err?.message === 'string'
          ? err.message
          : undefined;

    // If no message, map to an empty array (which flatMap will remove)
    if (!message) {
      return [];
    }

    // Try to translate
    try {
      // Map to a one-item array
      return [{ message: t(message) }];
    } catch {
      // Fallback: map to a one-item array with the raw message
      return [{ message }];
    }
  });
};
