import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './SearchFeature.css';

const MIN_SEARCH_LENGTH = 3;
const MAX_SEARCH_LENGTH = 100;

interface SearchFeatureProps {
  onSearch: (query: string, coordinates?: { lat: number; lng: number }) => void;
  onError?: (error: Error) => void;
  initialValue?: string;
  disabled?: boolean;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Type guard to validate coordinates
const isValidCoordinates = (coords: unknown): coords is Coordinates => {
  if (typeof coords !== 'object' || coords === null) return false;
  const { lat, lng } = coords as Record<string, unknown>;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

type ValidationErrorType =
  | 'EMPTY_INPUT'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'GEOLOCATION_NOT_SUPPORTED'
  | 'GEOLOCATION_PERMISSION_DENIED'
  | 'GEOLOCATION_UNAVAILABLE'
  | 'GEOLOCATION_TIMEOUT'
  | 'INVALID_CHARACTERS'
  | 'UNKNOWN';

interface ValidationError {
  type: ValidationErrorType;
  message: string;
}

// Simple location icon SVG
const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="24"
    height="24"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

export const SearchFeature: React.FC<SearchFeatureProps> = ({
  onSearch,
  onError,
  initialValue = '',
  disabled = false,
}) => {
  const [postcode, setPostcode] = useState<string>(initialValue);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  const validateInput = useCallback((input: string): ValidationError | null => {
    const trimmed = input.trim();

    if (!trimmed) {
      return { type: 'EMPTY_INPUT', message: 'Please enter a postcode or location' };
    }
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      return { type: 'TOO_SHORT', message: `Please enter at least ${MIN_SEARCH_LENGTH} characters` };
    }
    if (trimmed.length > MAX_SEARCH_LENGTH) {
      return { type: 'TOO_LONG', message: `Search is too long (max ${MAX_SEARCH_LENGTH} characters)` };
    }

    const dangerousChars = /[<>{}[\]\\]/;
    if (dangerousChars.test(trimmed)) {
      return {
        type: 'INVALID_CHARACTERS',
        message: 'Invalid characters detected. Please use only letters, numbers, and spaces.',
      };
    }

    return null;
  }, []);

  useEffect(() => {
    if (!disabled) {
      searchInputRef.current?.focus();
    }
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;

    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [disabled]);

  useEffect(() => {
    const trimmed = postcode.trim();
    if (validationError && trimmed.length > 0) {
      setValidationError(null);
    }
  }, [postcode, validationError]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      if (disabled) return;

      const trimmed = postcode.trim();
      const error = validateInput(trimmed);

      if (error) {
        setValidationError(error);
        searchInputRef.current?.focus();
        if (onError) onError(new Error(`Validation Error: ${error.message}`));
        return;
      }

      try {
        setValidationError(null);
        onSearch(trimmed);
        // Navigation intentionally handled by parent (SearchPage)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setValidationError({ type: 'UNKNOWN', message: `Search failed: ${errorMessage}` });
        if (onError) onError(err instanceof Error ? err : new Error(errorMessage));
      }
      navigate(`/${trimmed}`);
        
    },
    [postcode, onSearch, onError, disabled, validateInput, navigate]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      if (value.length > MAX_SEARCH_LENGTH) {
        setValidationError({ type: 'TOO_LONG', message: `Maximum ${MAX_SEARCH_LENGTH} characters allowed` });
        return;
      }
      if (validationError && value.trim().length >= MIN_SEARCH_LENGTH) {
        setValidationError(null);
      }
      setPostcode(value);
    },
    [validationError]
     
  );

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setPostcode('');
      setValidationError(null);
    }
  }, []);

  const handleCurrentLocation = useCallback((): void => {
    if (disabled) return;

    if (!('geolocation' in navigator)) {
      const error: ValidationError = {
        type: 'GEOLOCATION_NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser',
      };
      setValidationError(error);
      searchInputRef.current?.focus();
      if (onError) onError && onError(new Error(error.message));
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setGettingLocation(true);
    setValidationError(null);

    const timeoutId = setTimeout(() => {
      setGettingLocation(false);
      const error: ValidationError = {
        type: 'GEOLOCATION_TIMEOUT',
        message: 'Location request timed out. Please try again or enter a postcode.',
      };
      setValidationError(error);
      if (onError) onError(new Error(error.message));
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        clearTimeout(timeoutId);
        setGettingLocation(false);

        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!isValidCoordinates(coords)) {
          const error: ValidationError = {
            type: 'GEOLOCATION_UNAVAILABLE',
            message: 'Invalid location data received. Please try again.',
          };
          setValidationError(error);
          if (onError) onError(new Error(error.message));
          return;
        }

        try {
          setPostcode('Current Location')
          setValidationError(null);
          onSearch('Current Location', coords);
          // Navigation handled by parent (SearchPage)
           navigate(`/location?lat=${encodeURIComponent(String(coords.lat))}&lng=${encodeURIComponent(String(coords.lng))}`);
        
        
          } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setValidationError({ type: 'UNKNOWN', message: `Failed to search location: ${errorMessage}` });
          if (onError) onError(err instanceof Error ? err : new Error(errorMessage));
        }
      },
      (err: GeolocationPositionError) => {
        clearTimeout(timeoutId);
        setGettingLocation(false);
        setPostcode('');

        let error: ValidationError;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            error = {
              type: 'GEOLOCATION_PERMISSION_DENIED',
              message: 'Location access denied. Please enable location permissions in your browser settings.',
            };
            break;
          case err.POSITION_UNAVAILABLE:
            error = {
              type: 'GEOLOCATION_UNAVAILABLE',
              message: 'Location information is unavailable. Please try again or enter a postcode.',
            };
            break;
          case err.TIMEOUT:
            error = {
              type: 'GEOLOCATION_TIMEOUT',
              message: 'Location request timed out. Please try again or enter a postcode.',
            };
            break;
          default:
            error = { type: 'UNKNOWN', message: 'Unable to get your location. Please enter a postcode.' };
        }

        setValidationError(error);
        searchInputRef.current?.focus();
        if (onError) onError(new Error(`Geolocation Error (${err.code}): ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );


   
  }, [onSearch, onError, disabled,navigate]);

  const loading = gettingLocation;
  const trimmedLength = postcode.trim().length;
  const canSearch = !loading && !disabled && trimmedLength >= MIN_SEARCH_LENGTH;
  const showLengthWarning = trimmedLength > 0 && trimmedLength < MIN_SEARCH_LENGTH;
const trimmed = postcode.trim();
   const pageTitle =
    gettingLocation
      ? 'Finding stores near you — Morrisons Store Finder'
      : trimmedLength >= MIN_SEARCH_LENGTH
      ? `Stores near ${trimmed} — Morrisons Store Finder`
      : 'Find a Morrisons store — Morrisons Store Finder';

  const pageDescription =
    trimmedLength >= MIN_SEARCH_LENGTH
      ? `Search results for ${trimmed}. Find nearby Morrisons stores, opening times and services.`
      : 'Search for your nearest Morrisons store by postcode or use your current location.';

  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>


    <div className="search-container">
      <div className="search_section">
        <header className="heading">
          <h1>Welcome to your Morrisons Store Finder</h1>
          <p>Enter a postcode or town below to search for your nearest store and find its opening times</p>
        </header>

        {validationError && (
          <div className="validation-error" role="alert" aria-live="assertive">
            <svg className="error-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor"
              />
            </svg>
            <span>{validationError.message}</span>
            <button
              className="error-close"
              onClick={() => setValidationError(null)}
              aria-label="Dismiss error"
              type="button"
              disabled={disabled}
            >
              ✕
            </button>
          </div>
        )}

        <form className="input_section" onSubmit={handleSubmit} noValidate>
          <div className="input_container">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 9.5 5 13 7.01 13 9.5 10.99 14 9.5 14z" />
            </svg>
            <input
              ref={searchInputRef}
              className={`input_button ${validationError ? 'error' : ''} ${showLengthWarning ? 'warning' : ''}`}
              type="search"
              placeholder="Enter Postcode or location"
              value={postcode}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              disabled={loading || disabled}
              aria-label="Postcode or location search"
              aria-describedby="search-hint"
              aria-invalid={!!validationError}
              autoComplete="postal-code"
              enterKeyHint="search"
              minLength={MIN_SEARCH_LENGTH}
              maxLength={MAX_SEARCH_LENGTH}
              required
            />

            <button
              type="button"
              className="current-location-badge"
              onClick={handleCurrentLocation}
              disabled={loading || disabled}
              aria-label={loading ? 'Getting your location...' : 'Use current location'}
              title="Use my current location"
            >
              <LocationIcon className={`current-location-icon ${gettingLocation ? 'spinning' : ''}`} />
            </button>
          </div>

          <button type="submit" className="search_button" disabled={!canSearch} aria-label="Enter Postcode or location">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {showLengthWarning && !validationError && (
          <p className="input-hint warning" aria-hidden="true">
            ⚠️ Enter at least {MIN_SEARCH_LENGTH} characters (current: {trimmedLength})
          </p>
        )}

        {trimmedLength >= MIN_SEARCH_LENGTH && !validationError && !disabled && (
          <p className="input-hint success" aria-hidden="true">
            ✓ Ready to search
          </p>
        )}

        {disabled && (
          <p className="input-hint disabled" aria-hidden="true">
            Search is currently disabled
          </p>
        )}
      </div>
    </div>
    </>
  );
};

export default SearchFeature;