import { useState, useCallback } from 'react';

export interface Coordinates {
    lat: number;
    lon: number;
}

interface GeocodeResponse {
    status: string;
    results?: Array<{ geometry: { location: { lat: number; lng: number } } }>;
    error_message?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;;
// console.log("GOOGLE_MAPS_API_KEY in useGeoCode:", GOOGLE_MAPS_API_KEY);

export function useGeocode() {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchLocationCoordinates = useCallback(async (postcode: string): Promise<void> => {
        if (!GOOGLE_MAPS_API_KEY) {
            setError('Google Maps API key is not configured');
            return;
        }

        setLoading(true);
        setError(null);

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${GOOGLE_MAPS_API_KEY}&components=country:GB`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Geocoding API failed with status: ${response.status}`);

            const data: GeocodeResponse = await response.json();
            if (data.status === "ZERO_RESULTS") throw new Error("Postcode not found. Please check and try again.");
            if (data.status === "INVALID_REQUEST") throw new Error("Invalid postcode format.");
            if (data.status !== "OK" || !data.results?.length) throw new Error(data.error_message || "Unable to geocode the postcode.");

            const { lat, lng } = data.results[0].geometry.location;
            setCoordinates({ lat, lon: lng });
        } catch (err: any) {
            setError(err.message || 'Unexpected error while fetching location.');
        } finally {
            setLoading(false);
        }
    }, []);

    return { coordinates, error, loading, fetchLocationCoordinates };
}
