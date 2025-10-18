export const storage = {
  save: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Unsupported or quota exceeded
    }
  },

  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Unsupported
    }
  },
};
