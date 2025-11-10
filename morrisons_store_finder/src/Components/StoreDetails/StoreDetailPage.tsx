import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStoreDetails from '../../Hooks/useStoreDetails';
import { storeCache } from '../StoreCache/StoreCache';
import { SiMorrisons } from "react-icons/si";
import './StoreDetailsPage.css';

// Types
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

type AddressObject = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
};

// Constants
const DAY_NAMES: { [key: string]: string } = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Utility Functions
const formatTime = (timeStr: string): string => {
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const minute = m;
  const suffix = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12 || 12;
  return `${hour}:${minute}${suffix}`;
};

const formatAddress = (address: AddressObject | string | null | undefined): string => {
  if (!address) return 'No address available';
  if (typeof address === 'string') return address;
  
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.county,
    address.postcode,
    address.country,
  ].filter(Boolean);
  
  return parts.length ? parts.join(', ') : 'No address available';
};

// Icons
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const StoreDetailPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { details, loading, error, fetchDetails, clearDetails } = useStoreDetails();
  
  // ✅ Track if we're using cached data
  const [cachedData, setCachedData] = useState<any>(null);

  console.log("details:", details);

  useEffect(() => {
    if (!storeId) {
      navigate('/');
      return;
    }

    console.log('\n🔍 ========== CACHE CHECK START ==========');
    console.log(`🔍 Store ID: ${storeId}`);

    // ✅ Check cache FIRST
    const cached = storeCache.get(storeId);
    
    if (cached) {
      console.log('✅ CACHE HIT - Using cached data');
      console.log('📦 Cached data:', cached);
      console.log('🚫 API CALL SKIPPED ✨');
      console.log('========== CACHE CHECK END (CACHED) ==========\n');
      
      // ✅ Set cached data and SKIP fetchDetails
      setCachedData(cached);
      return; // ✅ EARLY RETURN - Don't call fetchDetails!
    }

    console.log('❌ CACHE MISS - Will fetch from API');
    console.log('📡 Calling fetchDetails...');
    console.log('========== CACHE CHECK END (FETCHING) ==========\n');
    
    // ✅ Clear cached data and fetch from API
    setCachedData(null);
    fetchDetails(storeId);

    return () => {
      clearDetails();
    };
  }, [storeId, fetchDetails, clearDetails, navigate]);

  const MorrisonsIcon = SiMorrisons as React.ComponentType<{ className?: string }>;

  // ✅ Use cached data if available, otherwise use details from hook
  const displayData = cachedData || details;

  // ✅ Only show loading if we're not using cache
  if (loading && !cachedData) {
    return (
      <div className="store-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading store details...</p>
        </div>
      </div>
    );
  }

  // ✅ Only show error if we're not using cache
  if (error && !cachedData) {
    return (
      <div className="store-detail-page">
        <div className="error-container">
          <h2>Error Loading Store Details</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="store-detail-page">
        <div className="error-container">
          <h2>Store Not Found</h2>
          <p>The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering store details:', displayData);
  console.log(`📊 Data source: ${cachedData ? 'CACHE ⚡' : 'API 🌐'}`);

  return (
    <div className="store-detail-page">
      <div className="store-detail-container">
        {/* Header with store name and opening time */}
        <div className="detail-header">
          <div className="detail_store_header">Store Finder {'>'} {displayData.storeName}</div>
          <div><h1 className="store-title">{displayData.storeName}</h1></div>
          <div><p className="store-hours">
            {displayData.openingTimes.open} - {displayData.openingTimes.close}
          </p></div>
        </div>

        {/* Main Content */}
        <div className="detail-content">
          <div className="opening-services-container">
            {/* Left: Opening hours */}
            <section className="opening-times-section">
              <h2>Opening Hours</h2>
              <ul className="opening-times-list">
                {['mon','tue','wed','thu','fri','sat','sun'].map((dayKey) => {
                  const map: any = {
                    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
                    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
                  };
                  const times = (displayData.openingTimes as any)?.[dayKey];
                  const format = (t?: string) => {
                    if (!t) return '';
                    const [h, m] = t.split(':'); let hr = parseInt(h, 10);
                    const suf = hr >= 12 ? 'pm' : 'am'; hr = hr % 12 || 12;
                    return `${hr}:${m}${suf}`;
                  };
                  return (
                    <li key={dayKey} className="opening-time-item">
                      <span className="day-name">{map[dayKey]}</span>
                      <span className="day-hours">
                        {times ? `${format(times.open)} - ${format(times.close)}` : 'Closed'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Services Section */}
            <div className="services-section">
              <h2>Services</h2>
              <ul className="services-list">
                {displayData.services && displayData.services.length > 0 ? (
                  displayData.services.map((service: any, index: number) => (
                    <li key={index} className="service-item">
                      <div className="service-content">
                        <div className="service-icon-badge">
                          <MorrisonsIcon className="service-icon" />
                        </div>
                        <div className="service-name">
                          <span>{service.serviceName || service}</span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>No services available</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Service icon component
const ServiceIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export default StoreDetailPage;