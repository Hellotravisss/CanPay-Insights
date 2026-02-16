/**
 * Anonymous User Management
 * Generates a unique ID for each browser/device without requiring login
 */

const ANONYMOUS_USER_KEY = 'canpay_anonymous_user_id';

/**
 * Get or create an anonymous user ID
 * This ID persists across page reloads but is device-specific
 */
export const getAnonymousUserId = (): string => {
  try {
    // Check if we already have an ID
    let userId = localStorage.getItem(ANONYMOUS_USER_KEY);
    
    if (!userId) {
      // Generate a new UUID v4
      userId = generateUUID();
      localStorage.setItem(ANONYMOUS_USER_KEY, userId);
    }
    
    return userId;
  } catch (err) {
    console.error('Failed to get anonymous user ID:', err);
    // Fallback to session-only ID
    return generateUUID();
  }
};

/**
 * Simple UUID v4 generator
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Clear anonymous user ID (for testing or reset)
 */
export const clearAnonymousUserId = (): void => {
  try {
    localStorage.removeItem(ANONYMOUS_USER_KEY);
  } catch (err) {
    console.error('Failed to clear anonymous user ID:', err);
  }
};
