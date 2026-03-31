const FAVORITES_KEY = 'morrisons_favorites';

export interface FavoriteStore {
  id: string;
  name: string;
  storeName: string;
  address: any;
  addedAt: number;
}

export const favoritesService = {
  // Get all favorites
  getAll: (): FavoriteStore[] => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  },

  // Add to favorites
  add: (store: any): boolean => {
    try {
      const favorites = favoritesService.getAll();
      const storeId = String(store.name || store.id);

      // Check if already exists
      if (favorites.some((fav) => fav.id === storeId)) {
        console.log(`⚠️ Store ${storeId} already in favorites`);
        return false;
      }

      const favorite: FavoriteStore = {
        id: storeId,
        name: String(store.name),
        storeName: String(store.storeName),
        address: store.address,
        addedAt: Date.now(),
      };

      favorites.push(favorite);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      console.log(`⭐ Added store ${storeId} to favorites`);
      return true;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  },

  // Remove from favorites
  remove: (storeId: string): boolean => {
    try {
      const favorites = favoritesService.getAll();
      const filtered = favorites.filter((fav) => fav.id !== storeId);

      if (filtered.length === favorites.length) {
        console.log(`⚠️ Store ${storeId} not in favorites`);
        return false;
      }

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      console.log(`🗑️ Removed store ${storeId} from favorites`);
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  },

  // Check if store is favorite
  isFavorite: (storeId: string): boolean => {
    const favorites = favoritesService.getAll();
    return favorites.some((fav) => fav.id === storeId);
  },

  // Clear all favorites
  clearAll: (): void => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      console.log('🗑️ Cleared all favorites');
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  },
};