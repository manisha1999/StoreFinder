// ...existing code...
import React, { useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStoreDetails from '../../Hooks/useStoreDetails';
import { storeCache } from '../StoreCache/StoreCache';

import './StoreDetailsPage.css';
import logo from '../../logo.svg';

/* --- Move small helpers/constants to module scope for reuse and tree-shaking --- */
const NavBarLazy = lazy(() => import('../NavBar/NavBar'));
const FooterLazy = lazy(() => import('../Footer/Footer'));
const SiMorrisonsLazy = lazy(() =>
 import('react-icons/si').then((m) => {
    // assert the imported icon has the correct component type for React.lazy
   const Icon = (m as { SiMorrisons?: React.ComponentType<any> }).SiMorrisons;
    return { default: (Icon as React.ComponentType<any>) };
  })
);

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
};

const formatTime = (t?: string) => {
  if (!t) return '';
  const [h = '0', m = '00'] = String(t).split(':');
  const hour = parseInt(h, 10) || 0;
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m}${suffix}`;
};
/* --- end module-scope helpers --- */

/* Lightweight types (kept local for now) */
interface DayOpening { open?: string; close?: string; }
interface OpeningTimes { mon?: DayOpening; tue?: DayOpening; wed?: DayOpening; thu?: DayOpening; fri?: DayOpening; sat?: DayOpening; sun?: DayOpening; [k: string]: DayOpening | undefined; }
interface ServiceItem { serviceName?: string; [k: string]: unknown; }
interface StoreDetails { storeName: string; openingTimes?: OpeningTimes; services?: ServiceItem[] | string[]; [k: string]: unknown; }

const StoreDetailPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { details, loading, error, fetchDetails, clearDetails } = useStoreDetails();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!storeId) { navigate('/'); return; }
    const cached = storeCache.get(storeId);
    // Use cache if available but still trigger fetch to reconcile/refresh
    if (!cached) fetchDetails(storeId).catch(() => {});
    else fetchDetails(storeId).catch(() => {});
    return () => { clearDetails?.(); };
  }, [storeId, fetchDetails, clearDetails, navigate]);

  const todayKey = useMemo(() => DAY_ORDER[new Date().getDay()], []);
  const todaysTimes = (details as StoreDetails | undefined)?.openingTimes?.[todayKey] ?? null;
  const openText = todaysTimes?.open ? formatTime(todaysTimes.open) : null;
  const closeText = todaysTimes?.close ? formatTime(todaysTimes.close) : null;

  // focus heading when details load
  useEffect(() => { if (details && headingRef.current) headingRef.current.focus(); }, [details]);

  // Escape -> back, and restore focus on unmount
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); navigate(-1); }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [navigate]);

  if (loading) {
    return (
      <div className="store-detail-page" role="status" aria-live="polite">
        <div className="loading-container"><div className="spinner" /><p>Loading store details…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-detail-page" role="alert" aria-live="assertive">
        <div className="error-container"><h2>Error Loading Store Details</h2><p>{String(error)}</p></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="store-detail-page" role="status">
        <div className="error-container"><h2>Store Not Found</h2><p>The store you're looking for doesn't exist.</p></div>
      </div>
    );
  }

  return (
    <div>
      <Suspense fallback={null}><NavBarLazy /></Suspense>
      <img
              className="logo"
              src={logo}
              alt="Company logo"
              style={{ display: 'block', maxWidth: 100, width: '100%', height: 'auto' ,marginLeft:'100px'}}
            />
      <main className="store-detail-page" role="main" aria-labelledby="store-title">
        <div className="store-detail-container">
          <header className="detail-header" aria-labelledby="store-title">
            {/* <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">← Back</button> */}
            <div>
              <p>{`Store Finder > ${details.storeName}`}</p>
              <h1 id="store-title" ref={headingRef} tabIndex={-1} className="store-title">{details.storeName}</h1>
              <p className="store-hours" aria-live="polite">
                {openText && closeText ? `Open Today ${openText} - ${closeText}` : 'Closed Today'}
              </p>
            </div>
          </header>

          <div className="detail-content">
            <div className="opening-services-container">
              <section className="opening-times-section" aria-labelledby="opening-hours-heading">
                <h2 id="opening-hours-heading">Opening Hours</h2>
                <ul className="opening-times-list">
                  {DAY_ORDER.map((dayKey) => {
                    const times = (details.openingTimes as OpeningTimes | undefined)?.[dayKey];
                    return (
                      <li key={dayKey} className="opening-time-item">
                        <span className="day-name">{DAY_LABELS[dayKey]}</span>
                        <span className="day-hours">{times ? `${formatTime(times.open)} - ${formatTime(times.close)}` : 'Closed'}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="services-section" aria-labelledby="services-heading">
                <h2 id="services-heading">Services</h2>
                <ul className="services-list" aria-live="polite">
                  {Array.isArray(details.services) && details.services.length > 0 ? (
                    details.services.map((service: any, index: number) => (
                      <li key={index} className="service-item">
                        <div className="service-content">
                          <div className="service-icon-badge" aria-hidden>
                            <Suspense fallback={<span className="service-icon" aria-hidden />}>
                              <SiMorrisonsLazy className="service-icon" />
                            </Suspense>
                          </div>
                          <div className="service-name">
                            <span>{(service && (service.serviceName ?? service)) ?? 'Service'}</span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>No services available</li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}><FooterLazy /></Suspense>
    </div>
  );
};

export default StoreDetailPage;
// ...existing code...