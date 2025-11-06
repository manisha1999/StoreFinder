export interface Coordinates {
    lat: number;
    lon: number;
}

interface GeocodeResponse {
    status: string;
    results?: Array<{
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }>;
    error_message?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured');
}

export async function fetchLocationCoordinates(postcode: string): Promise<Coordinates> {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is not configured');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${GOOGLE_MAPS_API_KEY}&components=country:GB`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Geocoding API failed with status: ${response.status}`);
        }

        const data: GeocodeResponse = await response.json();

        if (data.status === "ZERO_RESULTS") {
            throw new Error("Postcode not found. Please check and try again.");
        }

        if (data.status === "INVALID_REQUEST") {
            throw new Error("Invalid postcode format.");
        }

        if (data.status !== "OK" || !data.results?.length) {
            throw new Error(data.error_message || "Unable to geocode the postcode.");
        }

        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lon: lng };
    } catch (error) {
        console.error('Geocoding error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while fetching location.');
    }
}