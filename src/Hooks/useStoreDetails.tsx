import { useCallback, useState, useRef } from "react";
import { storeCache } from '../Components/StoreCache/StoreCache';

// Remove API key and direct API URL from frontend
// const MORRISONS_API_KEY = process.env.REACT_APP_MORRISONS_API_KEY || 'APIKEY';
// const API_BASE_URL = 'https://uat-api.morrisons.com/location/v2/stores';
const INCLUDE_PARAMS = 'departments,services,linkedStores';

// Types
export interface StoreDetails {
  id: string | number;
  name?: string | number;
  storeName: string;
  address?: any;
  openingTimes?: any;
  departments?: any[];
  services?: any[];
  linkedStores?: any[];
  linkedLocations?: any[];
  [key: string]: any;
}

interface UseStoreDetailsReturn {
  details: StoreDetails | null;
  loading: boolean;
  error: string | null;
  fetchDetails: (storeId: string | number) => Promise<void>;
  clearDetails: () => void;
  isFromCache: boolean;
}

// Utility function for building proxy URL
const buildStoreDetailsUrl = (storeId: string | number): string => {
  // Use proxy endpoint; API key is handled by backend
  const url = `/api/morrisons/${encodeURIComponent(String(storeId))}?include=${INCLUDE_PARAMS}`;
  console.log('🌐 Building proxy URL:', url);
  return url;
};

export function useStoreDetails(): UseStoreDetailsReturn {
  const [details, setDetails] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  // Track the latest request to prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDetails = useCallback(async (storeId: string | number) => {
    const storeIdString = String(storeId);
    console.log(`\n🔍 ========== FETCH DETAILS START ==========`);
    console.log(`🔍 Store ID: ${storeIdString}`);

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('⚠️ Aborted previous request');
    }

    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      // ✅ Step 1: Check cache first
      const cached = localStorage.getItem(`store_cache_${storeIdString}`) ? JSON.parse(localStorage.getItem(`store_cache_${storeIdString}`) || '') : null;
      if (cached) {
        console.log('✅ Cache HIT for', storeIdString);
        console.log('👉 Cached services:', cached.data.services, 'Cached departments:', cached.data.departments);
        console.log("cachedData in useStoreDetails:", cached.data);
        setDetails(cached.data);
        setIsFromCache(true);
        setError(null);
        console.log(`========== FETCH DETAILS END (CACHE) ==========\n`);
        return;
      } else {
        console.log('❌ Cache MISS for', storeIdString);
      }

      // ✅ Step 2: No cache, fetch from API (via proxy)
      console.log('📡 Fetching from API...');
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const url = buildStoreDetailsUrl(storeId);
      console.log('🌐 Requesting URL:', url);

      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Response data received:', data);

      // ✅ Store in cache for future use
      storeCache.set(storeIdString,  data );
      // localStorage.setItem(`store_cache_${storeIdString}`, JSON.stringify({ data, timestamp: Date.now() }));
      console.log('💾 Cached store', storeIdString, 'data:', data);

      setDetails(data);
      setIsFromCache(false);
      setError(null);

      console.log('Fetched store details:', data);
      console.log(`========== FETCH DETAILS END (API) ==========\n`);
    } catch (e: any) {
      // Don't set error state if request was aborted
      if (e.name === 'AbortError') {
        console.log('⚠️ Request aborted');
        console.log(`========== FETCH DETAILS END (ABORTED) ==========\n`);
        return;
      }
      const errorMessage = e.message || "Error fetching store details";
      console.error('❌ Store details fetch error:', errorMessage);
      console.error('❌ Full error:', e);

      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setError(errorMessage);
        setDetails(null);
        setIsFromCache(false);
      }
      console.log(`========== FETCH DETAILS END (ERROR) ==========\n`);
    } finally {
      if (!abortControllerRef.current || !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const clearDetails = useCallback(() => {
    console.log('🧹 Clearing details');
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDetails(null);
    setError(null);
    setLoading(false);
    setIsFromCache(false);
  }, []);

  console.log('useStoreDetails state:', { details, loading, error, isFromCache });
  return { 
    details, 
    loading, 
    error, 
    fetchDetails,
    clearDetails,
    isFromCache
  };
}

export default useStoreDetails;
