import { useCallback, useState, useRef } from "react";

// Constants
const MORRISONS_API_KEY = process.env.REACT_APP_MORRISONS_API_KEY || 'APIKEY';
const API_BASE_URL = 'https://uat-api.morrisons.com/location/v2/stores';
const INCLUDE_PARAMS = 'departments,services,linkedStores';

// Types
export interface StoreDetails {
  id: string | number;
  storeName: string;
  address?: any;
  openingTimes?: any;
  departments?: any[];
  services?: any[];
  linkedStores?: any[];
  [key: string]: any;
}

interface UseStoreDetailsReturn {
  details: StoreDetails | null;
  loading: boolean;
  error: string | null;
  fetchDetails: (storeId: string | number) => Promise<void>;
  clearDetails: () => void;
}

// Utility function for building URL
const buildStoreDetailsUrl = (storeId: string | number): string => {
  return `${API_BASE_URL}/${encodeURIComponent(String(storeId))}?apikey=${encodeURIComponent(MORRISONS_API_KEY)}&include=${INCLUDE_PARAMS}`;
};

export function useStoreDetails(): UseStoreDetailsReturn {
  const [details, setDetails] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track the latest request to prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDetails = useCallback(async (storeId: string | number) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildStoreDetailsUrl(storeId), {
        
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Only update state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setDetails(data);
        setError(null);
      }
    } catch (e: any) {
      // Don't set error state if request was aborted
      if (e.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

      const errorMessage = e.message || "Error fetching store details";
      console.error('Store details fetch error:', errorMessage);
      
      if (!abortController.signal.aborted) {
        setError(errorMessage);
        setDetails(null);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const clearDetails = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setDetails(null);
    setError(null);
    setLoading(false);
  }, []);

  return { 
    details, 
    loading, 
    error, 
    fetchDetails,
    clearDetails 
  };
}

export default useStoreDetails;