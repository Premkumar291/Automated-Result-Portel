import { checkAuth } from '../api/auth';

let currentUser = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get current user's college name with caching
 * @returns {Promise<string|null>} College name or null if not available
 */
// Promise deduplication
let activeFetchPromise = null;

/**
 * Get current user's college name with caching
 * @returns {Promise<string|null>} College name or null if not available
 */
export const getCurrentUserCollegeName = async () => {
  const now = Date.now();

  // Return cached user if still valid
  if (currentUser && (now - lastFetchTime) < CACHE_DURATION) {
    return currentUser.collegeName || null;
  }

  // Return active promise if one exists (deduplication)
  if (activeFetchPromise) {
    const user = await activeFetchPromise;
    return user?.collegeName || null;
  }

  try {
    // Create new promise
    activeFetchPromise = checkAuth()
      .then(authResponse => {
        if (authResponse.success && authResponse.user) {
          currentUser = authResponse.user;
          lastFetchTime = Date.now();
          return currentUser;
        }
        return null;
      })
      .catch(err => {
        console.error('Auth check failed:', err);
        return null;
      })
      .finally(() => {
        activeFetchPromise = null;
      });

    const user = await activeFetchPromise;
    return user?.collegeName || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
  }

  return null;
};