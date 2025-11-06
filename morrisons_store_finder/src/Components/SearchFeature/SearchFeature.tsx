import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGeocode } from '../../Hooks/useGeoCode';
import './SearchFeature.css';
import { BiCurrentLocation } from "react-icons/bi";

const CurrentLocationIcon = BiCurrentLocation as React.ComponentType<{ className?: string }>;
const DEBOUNCE_MS = 400;

interface SearchFeatureProps {
  onSearch: (query: string, coordinates?: { lat: number; lng: number }) => void;
}

export function SearchFeature({ onSearch }: SearchFeatureProps) {
  const [postcode, setPostcode] = useState('');
  const [clicked, setClicked] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const trimmedPostcode = useMemo(() => postcode.trim(), [postcode]);

  const loading = gettingLocation;
  const canSearch = !loading && trimmedPostcode.length > 0;

  // Debounce state
  const debounceIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>('');

  // Debounced auto-search on input change
  useEffect(() => {
    if (!trimmedPostcode) {
      lastQueryRef.current = '';
      return;
    }

    if (trimmedPostcode === lastQueryRef.current) return;

    if (debounceIdRef.current) {
      clearTimeout(debounceIdRef.current);
    }

    debounceIdRef.current = setTimeout(() => {
      console.log('⏱️ Debounced search triggered for:', trimmedPostcode);
      lastQueryRef.current = trimmedPostcode;
      // Just call onSearch with postcode, let Home handle the geocoding
      onSearch(trimmedPostcode);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceIdRef.current) {
        clearTimeout(debounceIdRef.current);
      }
    };
  }, [trimmedPostcode, onSearch]);

  useEffect(() => {
    return () => {
      if (debounceIdRef.current) {
        clearTimeout(debounceIdRef.current);
      }
    };
  }, []);

  const handleSearch = () => {
    if (!trimmedPostcode) return;
    console.log('🔍 Manual search triggered for:', trimmedPostcode);
    setClicked(true);
    if (debounceIdRef.current) {
      clearTimeout(debounceIdRef.current);
    }
    lastQueryRef.current = trimmedPostcode;
    // Just call onSearch with postcode, let Home handle the geocoding
    onSearch(trimmedPostcode);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
    setClicked(false);
  };

  // Get current location using browser geolocation
  const handleCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    console.log('📍 Getting current location...');
    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`✅ Got location: (${latitude}, ${longitude}), accuracy: ${accuracy}m`);
        setGettingLocation(false);
        // For current location, pass coordinates directly
        onSearch('Current Location', { lat: latitude, lng: longitude });
      },
      (err) => {
        setGettingLocation(false);
        setPostcode('');
        console.error('❌ Geolocation error:', err);
        
        let errorMessage = 'Unable to get your location. ';
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage += 'Please enable location access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage += 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          errorMessage += 'Location request timed out.';
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="search-container">
      <div className="search_section">
        <header className="heading">
          <h1>Welcome to your Morrisons Store Finder</h1>
          <p>Enter a postcode or town below to search for your nearest store and find its opening times</p>
        </header>

        <form className="input_section" onSubmit={handleSubmit}>
          <div className="input_container">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 9.5 5 13 7.01 13 9.5 10.99 14 9.5 14z" />
            </svg>
            <input
              className="input_button"
              type="text"
              placeholder="Enter Postcode or location"
              value={postcode}
              onChange={handleInputChange}
              disabled={loading || gettingLocation}
              aria-label="Postcode or location search"
              autoComplete="postal-code"
            />
            <button
              type="button"
              className="current-location-badge"
              onClick={handleCurrentLocation}
              disabled={loading || gettingLocation}
              aria-label="Use current location"
              title="Use my current location"
            >
              <CurrentLocationIcon
                className={`current-location-icon ${gettingLocation ? 'spinning' : ''}`}
              />
            </button>
          </div>
          <button
            type="submit"
            className={`search_button ${clicked ? 'clicked' : ''} ${loading ? 'loading' : ''}`}
            disabled={!canSearch}
            aria-label="Search for stores"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchFeature;