import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import useStoreDetails from '../../Hooks/useStoreDetails';
import { storeCache } from '../StoreCache/StoreCache';
import {favoritesService}  from '../Favourites/Favourites';
import './StoreCard.css';

type AddressObject = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
};

type DayOpeningHours = {
  open: string;
  close: string;
};

type OpeningTimes = {
  mon?: DayOpeningHours;
  tue?: DayOpeningHours;
  wed?: DayOpeningHours;
  thu?: DayOpeningHours;
  fri?: DayOpeningHours;
  sat?: DayOpeningHours;
  sun?: DayOpeningHours;
};

export type Store = {
  name: string | number;
  storeName: string;
  address?: string | AddressObject | null;
  distance?: number | null;
  openingTimes?: OpeningTimes | null;
  // Add any other fields that exist in your full store object
  storeFormat?: string;
  category?: string;
  location?: any;
  telephone?: string;
};

interface StoreCardProps {
  store: Store;
}

// Constants
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const METERS_TO_MILES = 1609.344;

// Helper to format "06:00:00" as "6:00am" or "07:00:00" as "7:00am"
const formatTime = (timeStr: string): string => {
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const minute = m;
  const suffix = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12 || 12;
  return `${hour}:${minute}${suffix}`;
};

const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

const getStoreStatus = (openingTimes: OpeningTimes | null | undefined): {
  isOpen: boolean;
  displayText: string;
} => {
  if (!openingTimes) {
    return { isOpen: false, displayText: 'Hours not available' };
  }
  
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const todayTimes = openingTimes[dayKey];
  
  if (!todayTimes) {
    return { isOpen: false, displayText: 'Closed today' };
  }
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(todayTimes.open);
  const closeMinutes = timeToMinutes(todayTimes.close);
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  
  const timeRange = `${formatTime(todayTimes.open)} - ${formatTime(todayTimes.close)}`;
  
  return isOpen
    ? { isOpen: true, displayText: `Open Today • ${timeRange}` }
    : { isOpen: false, displayText: `Closed • Opens ${formatTime(todayTimes.open)}` };
};

const isAddressObject = (addr: unknown): addr is AddressObject =>
  !!addr &&
  typeof addr === 'object' &&
  ('addressLine1' in (addr as any) ||
    'city' in (addr as any) ||
    'postcode' in (addr as any));

const getAddressLine1 = (addr: AddressObject | string | null | undefined): string => {
  if (!addr) return 'No address available';
  if (typeof addr === 'string') return addr;
  if (isAddressObject(addr)) {
    return addr.addressLine1 || 'No address available';
  }
  return 'No address available';
};

const formatDistanceMiles = (meters: unknown): string => {
  const n = typeof meters === 'number' ? meters : NaN;
  return Number.isFinite(n) ? (n / METERS_TO_MILES).toFixed(2) : 'N/A';
};

const generateSlug = (storeName: string): string => {
  if (!storeName || typeof storeName !== 'string') {
    return '';
  }
  return storeName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const navigate = useNavigate();
  // const { details, fetchDetails } = useStoreDetails();
const { fetchDetails } = useStoreDetails();
  // Favorite state
  const storeId = String(store.name);
  const [isFavorite, setIsFavorite] = useState(false);

  // Meta active when user focuses / hovers the card
  const [metaActive, setMetaActive] = useState(false);

  // Check if favorite on mount and listen for changes
  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(storeId));

    const handleFavoritesChange = () => {
      setIsFavorite(favoritesService.isFavorite(storeId));
    };

    window.addEventListener('favorites-changed', handleFavoritesChange);
    return () => {
      window.removeEventListener('favorites-changed', handleFavoritesChange);
    };
  }, [storeId]);

  // Memoize expensive computations
  const storeStatus = useMemo(() => getStoreStatus(store.openingTimes), [store.openingTimes]);
  const addressText = useMemo(() => getAddressLine1(store.address), [store.address]);
  const distanceText = useMemo(() => formatDistanceMiles(store.distance), [store.distance]);
  const storeSlug = useMemo(() => generateSlug(store.storeName), [store.storeName]);

  const addressId = `store-${storeId}-address`;

  const handleCardClick = async () => {
    try {
      // Trigger API call first (if hook supports it)
      await fetchDetails(storeId);
      // ensure we have something cached
      storeCache.get(storeId);
      navigate(`/storefinder/${storeId}/${storeSlug}`);
    } catch (error) {
      // fallback behaviour: cache list data and navigate
      storeCache.set(storeId, store);
      navigate(`/storefinder/${storeId}/${storeSlug}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering

    if (isFavorite) {
      favoritesService.remove(storeId);
      setIsFavorite(false);
    } else {
      favoritesService.add(store);
      setIsFavorite(true);
    }

    // Notify other components
    window.dispatchEvent(new Event('favorites-changed'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

 const metaTitle = store.storeName ? `${store.storeName} — Morrisons Store` : 'Morrisons Store';
  const metaDescription = `${addressText} • ${storeStatus.displayText}`;



  return (
    <>
     {metaActive && (
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/'} />
        </Helmet>
      )}

    <li 
      className="store-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open details for ${store.storeName}`}
      aria-describedby={addressId}
       onMouseEnter={() => setMetaActive(true)}
        onMouseLeave={() => setMetaActive(false)}
        onFocus={() => setMetaActive(true)}
        onBlur={() => setMetaActive(false)}
    >
      <div className="store-card-header">
        <h3 className="store-name">{store.storeName}</h3>

        <div className="store-card-actions">
          <button
            className={`favorite-icon ${isFavorite ? 'active' : ''}`}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <span aria-hidden>{isFavorite ? '★' : '☆'}</span>
          </button>

          <div className="distance-block" aria-hidden={false}>
            <span className="store-distance" aria-label={`${distanceText} miles away`}>
              {distanceText} miles
            </span>
          </div>
        </div>
      </div>

      <div className="store-card-body">
        <p id={addressId} className="store-address">
          {addressText}
        </p>
        {/* <p>{store}</p> */}
        <p className={`store-hours ${storeStatus.isOpen ? 'open' : 'closed'}`}>
          <span className="status-text">{storeStatus.displayText}</span>
        </p>
      </div>
    </li>
    </>
  );
};

export default StoreCard;