interface CachedStore {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY_PREFIX = 'store_cache_';

export const storeCache = {
  // Save store to cache
  set: (storeId: string, storeData: any): void => {
    const cached: CachedStore = {
      data: storeData,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${storeId}`, JSON.stringify(cached));
      console.log(`✅ Cached store ${storeId}`);
    } catch (error) {
      console.error('Failed to cache store:', error);
    }
  },

  // Get store from cache
  get: (storeId: string): any | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${storeId}`);
      if (!cached) return null;

      const parsed: CachedStore = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;
      const ageSeconds = Math.round(age / 1000);
      console.log("cachedData from StoreCache:", cached);
      // Check if cache is still valid (within 30 minutes)
      if (age < CACHE_DURATION) {
        console.log(`✅ Cache hit for store ${storeId} (age: ${ageSeconds}s)`);
        return JSON.parse(cached);
      }
      

      // Cache expired
      console.log(`⏰ Cache expired for store ${storeId}`);
      storeCache.remove(storeId);
      
      return null;
    } catch (error) {
      console.error('Failed to get cached store:', error);
      return null;
    }
  },

  // Remove store from cache
  remove: (storeId: string): void => {
    try {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${storeId}`);
    } catch (error) {
      console.error('Failed to remove cached store:', error);
    }
  },

  // Clear all expired caches
  clearExpired: (): void => {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed: CachedStore = JSON.parse(cached);
            if (now - parsed.timestamp >= CACHE_DURATION) {
              localStorage.removeItem(key);
              console.log(`🗑️ Removed expired cache: ${key}`);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to clear expired caches:', error);
    }
  },
};