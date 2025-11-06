import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStoreDetails from '../../Hooks/useStoreDetails';
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
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};


export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const navigate = useNavigate();
const { fetchDetails } = useStoreDetails();
  // Memoize expensive computations
  const storeStatus = useMemo(() => getStoreStatus(store.openingTimes), [store.openingTimes]);
  const addressText = useMemo(() => getAddressLine1(store.address), [store.address]);
  const distanceText = useMemo(() => formatDistanceMiles(store.distance), [store.distance]);
const storeSlug = useMemo(() => generateSlug(store.storeName), [store.storeName]);
  const handleCardClick = async () => {
    try {
      // Trigger API call first
      const storeData = await fetchDetails(store.name.toString());
      console.log('Fetched store details:', storeData);
      
      // Then navigate with correct URL format: /storefinder/{id}/{store-name-slug}
      navigate(`/storefinder/${store.name}/${storeSlug}`);
    } catch (error) {
      console.error('Error fetching store details:', error);
      // Still navigate even if API fails (detail page will handle the error)
      navigate(`/storefinder/${store.name}/${storeSlug}`);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };


  return (
    <li 
      className="store-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${store.storeName}, ${distanceText} miles away`}
    >
      <div className="store-card-header">
        <h3 className="store-name">{store.storeName}</h3>
        <span className="store-distance" aria-label={`${distanceText} miles away`}>
          {distanceText} miles
        </span>
      </div>
      <div className="store-card-body">
        <p className="store-address">
          
          {addressText}
        </p>
       
        <p className={`store-hours ${storeStatus.isOpen ? 'open' : 'closed'}`}>
          
          <span className="status-text">{storeStatus.displayText}</span>
        </p>
      </div>
    </li>
  );
};

export default StoreCard;