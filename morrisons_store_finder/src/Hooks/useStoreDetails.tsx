import { useCallback, useState, useRef } from "react";
import { storeCache } from '../Components/StoreCache/StoreCache';

// Constants
const MORRISONS_API_KEY = process.env.REACT_APP_MORRISONS_API_KEY || 'APIKEY';
const API_BASE_URL = 'https://uat-api.morrisons.com/location/v2/stores';
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

// Utility function for building URL
const buildStoreDetailsUrl = (storeId: string | number): string => {
  const url = `${API_BASE_URL}/${encodeURIComponent(String(storeId))}?apikey=${encodeURIComponent(MORRISONS_API_KEY)}&include=${INCLUDE_PARAMS}`;
  console.log('🌐 Building URL:', url);
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
      const cached = storeCache.get(storeIdString);
      if (cached) {
        console.log(`✅ Cache HIT for store ${storeIdString}`);
        console.log('📦 Cached data structure:', {
          hasServices: !!cached.services,
          servicesCount: cached.services?.length || 0,
          hasDepartments: !!cached.departments,
          departmentsCount: cached.departments?.length || 0,
          keys: Object.keys(cached)
        });
        
        // Check if cached data has services/departments
        if (!cached.services || !cached.departments) {
          console.log('⚠️ Cached data missing services/departments - will fetch fresh data');
          storeCache.remove(storeIdString);
        } else {
          console.log('✅ Using cached data - API CALL SKIPPED ✨');
          setDetails(cached);
          setIsFromCache(true);
          setLoading(false);
          console.log(`========== FETCH DETAILS END (CACHED) ==========\n`);
          return;
        }
      } else {
        console.log(`❌ Cache MISS for store ${storeIdString}`);
      }

      // ✅ Step 2: No cache or incomplete cache, fetch from API
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
      
      console.log('✅ API response received');
      console.log('📊 Response data structure:', {
        hasServices: !!data.services,
        servicesCount: data.services?.length || 0,
        hasDepartments: !!data.departments,
        departmentsCount: data.departments?.length || 0,
        hasLinkedLocations: !!data.linkedLocations,
        linkedLocationsCount: data.linkedLocations?.length || 0,
        keys: Object.keys(data)
      });
      
      // Log first few services/departments
      if (data.services?.length > 0) {
        console.log('📋 First 3 services:', data.services.slice(0, 3));
      } else {
        console.log('⚠️ No services in API response!');
      }
      
      if (data.departments?.length > 0) {
        console.log('🏢 Departments:', data.departments.map((d: any) => d.serviceName));
      } else {
        console.log('⚠️ No departments in API response!');
      }
      
      // Only update state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        // ✅ Step 3: Cache the API response
        storeCache.set(storeIdString, data);
        console.log(`💾 Cached store ${storeIdString} for 30 minutes`);
        
        setDetails(data);
        setIsFromCache(false);
        setError(null);
      }
      
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