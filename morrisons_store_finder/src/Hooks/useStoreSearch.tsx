import { useState, useCallback, useEffect,useRef } from 'react';
import { useGeocode, Coordinates } from './useGeoCode';

export interface Store {
    name: string | number;
    storeName: string;
    storeFormat: string;
    category: string;
    region: string;
    address: {
        addressLine1: string;
        addressLine2: string;
        county: string;
        city: string;
        postcode: string;
        country: string;
    };
    telephone: string;
    location: {
        latitude: number;
        longitude: number;
    };
    satnav: {
        latitude: number;
        longitude: number;
    };
    openingTimes: {
        mon: { open: string; close: string };
        tue: { open: string; close: string };
        wed: { open: string; close: string };
        thu: { open: string; close: string };
        fri: { open: string; close: string };
        sat: { open: string; close: string };
        sun: { open: string; close: string };
    };
    distance: number;
}

const API_URL = "https://uat-api.morrisons.com/location/v2/stores";
const API_KEY = process.env.REACT_APP_MORRISONS_API_KEY;

// Fetch stores from API
async function fetchStoresByCoordinates({ lat, lon }: Coordinates): Promise<Store[]> {
    const url = `${API_URL}?apikey=${API_KEY}&distance=50000&lat=${lat}&limit=10&lon=${lon}&offset=0&storeformat=supermarket&include=departments,services,linkedStores`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch stores: ${response.status}`);
    const result = await response.json();
    
    return result.stores as Store[];
}

export function useStoreSearch() {
    const [stores, setStores] = useState<Store[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchCoordinates, setSearchCoordinates] = useState<Coordinates | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    // Track if we're processing a postcode search
    const isProcessingPostcode = useRef(false);

    // Use geocoding hook
    const {
        coordinates: geocodeCoordinates,
        error: geocodeError,
        loading: geocodeLoading,
        fetchLocationCoordinates
    } = useGeocode();

    // When geocode coordinates are received, fetch stores automatically
    useEffect(() => {
        const fetchStores = async () => {
            if (geocodeCoordinates && isProcessingPostcode.current) {
                console.log('🎯 Geocoding complete, fetching stores for:', geocodeCoordinates);
                
                try {
                    setSearchCoordinates(geocodeCoordinates);
                    const storesList = await fetchStoresByCoordinates(geocodeCoordinates);
                    setStores(storesList);
                    setError(null);
                    console.log('✅ Store search complete:', storesList.length, 'stores found');
                } catch (err: any) {
                    console.error('❌ Store fetch error:', err);
                    setError(err.message || "Failed to fetch stores.");
                    setStores([]);
                } finally {
                    setLoading(false);
                    isProcessingPostcode.current = false;
                }
            }
        };

        fetchStores();
    }, [geocodeCoordinates]);

    // Handle geocode errors
    useEffect(() => {
        if (geocodeError && isProcessingPostcode.current) {
            console.error('❌ Geocode error:', geocodeError);
            setError(geocodeError);
            setStores([]);
            setLoading(false);
            isProcessingPostcode.current = false;
        }
    }, [geocodeError]);
    


  
     // Search by postcode
    const searchStoresByPostcode = useCallback(async (postcode: string) => {
        console.log('🔍 Searching by postcode:', postcode);
        
        setError(null);
        setStores(null);
        setLoading(true);
        setSearchQuery(postcode);
        isProcessingPostcode.current = true;

        try {
            // Trigger geocoding - stores will be fetched in useEffect when coordinates arrive
            await fetchLocationCoordinates(postcode);
        } catch (err: any) {
            console.error('❌ Postcode search error:', err);
            setError(err.message || "Failed to find location.");
            setStores([]);
            setLoading(false);
            isProcessingPostcode.current = false;
        }
    }, [fetchLocationCoordinates]);
    // Search by current location
    const searchStoresByCurrentLocation = useCallback(async () => {
        setError(null);
        setStores(null);
        setLoading(true);
        setSearchQuery('Current Location');

        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser.');
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            });

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const coords = { lat, lon };
            setSearchCoordinates(coords);
            
            const storesList = await fetchStoresByCoordinates(coords);
            setStores(storesList);
        } catch (err: any) {
            let errorMessage = 'Failed to get current location.';
            
            if (err.code === 1) {
                errorMessage = 'Location permission denied. Please enable location access.';
            } else if (err.code === 2) {
                errorMessage = 'Location unavailable. Please try again.';
            } else if (err.code === 3) {
                errorMessage = 'Location request timed out. Please try again.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            setStores([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stores,
        loading: loading || geocodeLoading,
        error: error || geocodeError,
        searchCoordinates,
        searchQuery,
        searchStoresByPostcode,
        searchStoresByCurrentLocation,
    };
}