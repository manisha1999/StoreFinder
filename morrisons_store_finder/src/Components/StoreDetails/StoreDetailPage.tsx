import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStoreDetails from '../../Hooks/useStoreDetails';
import { storeCache } from '../StoreCache/StoreCache';
// import morrisonsLogo from '../../assets/morrisonsLogo.png';
import { SiMorrisons } from "react-icons/si";
import NavBar from '../NavBar/NavBar';

import './StoreDetailsPage.css';
import Footer from '../Footer/Footer';

// Types
type DayOpeningHours = {
  open: string;
  close: string;
};

type openingTimes = {
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
  console.log("details:", details);

  useEffect(() => {
  if (!storeId) {
    navigate('/');
    return;
  }

  // Try to get from cache first
  const cached = storeCache.get(storeId);
  if (cached) {
    console.log('✅ Using cached store data - API CALL SKIPPED');
    console.log('📦 Cached data:', cached);
    // Use cached data if your hook supports it
  } else {
    console.log('❌ No cache found - will fetch from API');
  }

  // Fetch details (will call API if not using cache)
  console.log('📡 Calling fetchDetails...');
  fetchDetails(storeId);

  // ...existing code...
}, [storeId, fetchDetails, clearDetails, navigate]);


const todayKey = DAY_ORDER[new Date().getDay()];
  const todaysTimes = (details?.openingTimes as any)?.[todayKey] ?? null;
   const formatTimeSafe = (t?: string) => {
    if (!t) return '';
    // reuse existing formatTime util if present otherwise fallback
    try { return formatTime(t); } catch { return t; }
  };

  const openText = todaysTimes?.open ? formatTimeSafe(todaysTimes.open) : null;
  const closeText = todaysTimes?.close ? formatTimeSafe(todaysTimes.close) : null;
  const todayLabel = openText && closeText ? `${openText} - ${closeText}` : 'Closed';


  const MorrisonsIcon = SiMorrisons as React.ComponentType<{ className?: string }>;

  if (loading) {
    return (
      <div className="store-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading store details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-detail-page">
        <div className="error-container">
          <h2>Error Loading Store Details</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="store-detail-page">
        <div className="error-container">
          <h2>Store Not Found</h2>
          <p>The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
console.log('✅ Rendering store details:', details.openingTimes);
  return (
    <div>
      <NavBar/>
    <div className="store-detail-page">
      <div className="store-detail-container">
        {/* Header with store name and opening time */}
        <div className="detail-header">
          <div className="detail_store_header">Store Finder {'>'} {details.storeName}</div>
          <div><h1 className="store-title">{details.storeName}</h1></div>
          <div><p className="store-hours">
           {openText && closeText ? (
                <> Open Today {openText} - {closeText} </>
              ) : (
                <> Closed Today </>
              )}
            </p>
          </div>
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
                  const times = (details.openingTimes as any)?.[dayKey];
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
                {details.services && details.services.length > 0 ? (
                  details.services.map((service: any, index: number) => (
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
    <Footer/>
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