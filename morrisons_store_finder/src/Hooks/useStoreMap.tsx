import { useState, useCallback } from 'react';

// Constants
const MORRISONS_API_KEY = process.env.REACT_APP_MORRISONS_API_KEY || 'APIKEY';
const API_BASE_URL = 'https://uat-api.morrisons.com/location/v2/stores';

// Types
export interface MapStore {
  id: string | number;
  storeName: string;
  latitude: number;
  longitude: number;
  address?: any;
  distance?: number;
  openingTimes?: any;
}

interface UseStoresMapReturn {
  stores: MapStore[];
  loading: boolean;
  error: string | null;
  fetchStoresForMap: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  clearStores: () => void;
}

// Utility function for building URL
const buildStoresMapUrl = (latitude: number, longitude: number, radius: number = 10): string => {
  const params = new URLSearchParams({
    apikey: MORRISONS_API_KEY,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
  });
  
  return `${API_BASE_URL}?${params.toString()}`;
};

export function useStoresMap(): UseStoresMapReturn {
  const [stores, setStores] = useState<MapStore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStoresForMap = useCallback(async (
    latitude: number,
    longitude: number,
    radius: number = 10
  ) => {
    if (!latitude || !longitude) {
      setError('Invalid coordinates provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = buildStoresMapUrl(latitude, longitude, radius);
      console.log('Fetching stores for map:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Map stores data:', data);

      // Handle different response structures
      let storesData: any[] = [];
      
      if (Array.isArray(data)) {
        storesData = data;
      } else if (data.stores && Array.isArray(data.stores)) {
        storesData = data.stores;
      } else if (data.data && Array.isArray(data.data)) {
        storesData = data.data;
      }

      // Filter stores that have valid coordinates
      const validStores = storesData
        .filter((store: any) => store.latitude && store.longitude)
        .map((store: any) => ({
          id: store.id || store.storeId,
          storeName: store.storeName || store.name || 'Unknown Store',
          latitude: parseFloat(store.latitude),
          longitude: parseFloat(store.longitude),
          address: store.address,
          distance: store.distance,
          openingTimes: store.openingTimes,
        }));

      console.log(`Found ${validStores.length} stores with valid coordinates`);
      setStores(validStores);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stores for map';
      console.error('Error fetching stores for map:', err);
      setError(errorMessage);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearStores = useCallback(() => {
    setStores([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    stores,
    loading,
    error,
    fetchStoresForMap,
    clearStores,
  };
}

export default useStoresMap;