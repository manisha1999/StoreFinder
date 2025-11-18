import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import StoreCard from '../StoreCard/StoreCard';
import './Screen2.css';
import StoreMap from '../StoreMap/StoreMap';
import Filter from '../Filters/Filter';
import FilterModal from '../FilterModal/FilterModal';

import { storeCache } from '../StoreCache/StoreCache';

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface Screen2Props {
  stores: any[];
  loading: boolean;
  error: string | null;
  searchQuery?: string;
  searchCoordinates?: { lat: number; lng: number } | null;
}

export interface Department {
  name: string;
  serviceName?: string;
  [key: string]: unknown;
}

export interface ServiceItem {
  name: string;
  serviceName?: string;
  [key: string]: unknown;
}

export interface LinkedLocationSummary {
  name?: number | string;
  storeName?: string;
  storeFormat?: string;
  category?: string;
  location?: LatLng;
  [key: string]: unknown;
}

export interface StoreDetails {
  id: string | number;
  name?: string | number;
  storeName: string;
  address?: any;
  openingTimes?: any;
  departments?: Department[];
  services?: ServiceItem[];
  linkedStores?: LinkedLocationSummary[];  
  linkedLocations?: LinkedLocationSummary[];
  [key: string]: any;
}

// Helpers for store-type filtering
const normalize = (s: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const isMorrisonsDaily = (store: any): boolean => {
  const name = normalize(store?.storeName || '');
  const format = normalize(store?.storeFormat || '');
  const category = store?.category || '';
  return (
    category === 'McColls' ||
    category === 'Gas Station' ||
    name.includes('daily') ||
    format.includes('daily')
  );
};

const isMorrisons = (store: any): boolean =>
  store?.category === 'Supermarket' && !isMorrisonsDaily(store);

// new helper: extract a reasonable city/locality name from a store object
const getCityFromStore = (store: any): string | null => {
  if (!store) return null;
  const candidates: Array<string | undefined | null> = [
    store.city,
    store.town,
    store.locality,
    store.postTown,
    store.county,
    store.address?.city,
    store.address?.town,
    store.address?.locality,
    store.address?.suburb,
    store.location?.city,
    store.storeName,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) {
      return c.trim();
    }
  }
  return null;
};

export const Screen2: React.FC<Screen2Props> = ({ 
  stores, 
  loading, 
  error,
  searchQuery, 
  searchCoordinates
}) => {
  // read URL params / query as fallback if parent didn't pass props
  const params = useParams<{ postcode?: string }>();
  const location = useLocation();

  const urlPostcode = params.postcode ? decodeURIComponent(params.postcode) : null;
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlLat = qs.get('lat');
  const urlLng = qs.get('lng');
  const urlCoords = (urlLat && urlLng && !Number.isNaN(Number(urlLat)) && !Number.isNaN(Number(urlLng)))
    ? { lat: Number(urlLat), lng: Number(urlLng) }
    : null;

  // effective values: prefer props, otherwise use URL values
  const effectiveSearchQuery = searchQuery ?? urlPostcode ?? null;
  const effectiveSearchCoordinates = searchCoordinates ?? urlCoords ?? null;

  
  const [modalOpen, setModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [showMorrisons, setShowMorrisons] = useState(false);
  const [showMorrisonsDaily, setShowMorrisonsDaily] = useState(false);
  // Applied filter store details cache
  const [detailsMap, setDetailsMap] = useState<Record<string, StoreDetails>>({});

  // Normalize stores
  const normalizedStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];
    return stores.map((store: any) => ({
      ...store,
      id: String(store.name || store.id || ''),
      storeName: String(store.storeName || 'Unknown Store'),
      lat: store.lat || store.location?.latitude || store.satnav?.latitude || 0,
      lng: store.lon || store.location?.longitude || store.satnav?.longitude || 0,
    }));
  }, [stores]);

  // Apply filters
  const filteredStores = useMemo(() => {
    let filtered = normalizedStores;

    // Apply Morrisons/Morrisons Daily filter
    if (showMorrisons && !showMorrisonsDaily) {
      filtered = filtered.filter(isMorrisons);
    } else if (showMorrisonsDaily && !showMorrisons) {
      filtered = filtered.filter(isMorrisonsDaily);
    } else if (showMorrisons && showMorrisonsDaily) {
      // Both selected - show both types
      filtered = filtered.filter((s) => isMorrisons(s) || isMorrisonsDaily(s));
    }

    // Sort by distance and limit to 10
    return filtered
      .sort((a: any, b: any) => (a?.distance ?? Infinity) - (b?.distance ?? Infinity))
      .slice(0, 10);
  }, [normalizedStores, showMorrisons, showMorrisonsDaily]);

  const hasActiveFilters = showMorrisons || showMorrisonsDaily;

  useEffect(() => {
    filteredStores.forEach((store) => {
      if (!detailsMap[store.id]) {
        const cached = storeCache.get(String(store.id));
        if (cached?.data) {
          setDetailsMap((prev) => ({
            ...prev,
            [store.id]: cached.data,
          }));
        } else {
          fetch(
            `https://uat-api.morrisons.com/location/v2/stores/${encodeURIComponent(store.id)}?apikey=${process.env.REACT_APP_MORRISONS_API_KEY}&include=departments,services,linkedStores`
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data) {
                storeCache.set(String(store.id), data);
                setDetailsMap((prev) => ({
                  ...prev,
                  [store.id]: data,
                }));
              }
            })
            .catch(() => {});
        }
      }
    });
  }, [filteredStores, detailsMap]);

  const storesWithServicesDepartments = filteredStores.filter((store) => {
    const details = detailsMap[store.id];
    return details && Array.isArray(details.services) && Array.isArray(details.departments);
  });
  console.log('Stores with services/departments:', storesWithServicesDepartments.length);

  const filteredStoresafterappliedfilters = useMemo(() => {
    if (!appliedFilters || appliedFilters.length === 0) return filteredStores;
    const normKey = (s: string) => normalize(String(s || '')).replace(/\s+/g, '');
    const normFilters = appliedFilters.map((f) => normKey(f));
    return filteredStores.filter((store) => {
      const details = detailsMap[store.id];
      if (!details) return false;
      const services = Array.isArray(details.services) ? details.services : [];
      const departments = Array.isArray(details.departments) ? details.departments : [];
      return normFilters.every((filter) => {
        const matchInServices = services.some((svc: any) => {
          const n1 = normKey(svc.name || svc.serviceName || '');
          return n1 === filter || n1.includes(filter);
        });
        const matchInDepartments = departments.some((dep: any) => {
          const n2 = normKey(dep.name || dep.serviceName || '');
          return n2 === filter || n2.includes(filter);
        });
        return matchInServices || matchInDepartments;
      });
    });
  }, [filteredStores, detailsMap, appliedFilters]);

  // compute nearest city/locality from the nearest store in filteredStores
  const nearestCity = useMemo(() => {
    if (!filteredStores || filteredStores.length === 0) return null;
    const nearest = filteredStores[0]; // filteredStores already sorted by distance
    return getCityFromStore(nearest);
  }, [filteredStores]);

  // Loading state
  if (loading) {
    return (
      <div className="screen2-container">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading stores...</p>
        </div>
      </div>
    );
  }

  // Error state
  // Error state
  if (error) {
    return (
      <div className="screen2-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No stores found
  // No stores found
  if (!stores || stores.length === 0) {
    return effectiveSearchQuery ? (
      <div className="screen2-container">
        <div className="no-results">
          <h2>No stores found</h2>
          <p>No stores found for "{effectiveSearchQuery}"</p>
          <p className="suggestion">Try searching with a different postcode or location.</p>
        </div>
      </div>
    ) : null;
  }

  // Filters applied but no results
  if (hasActiveFilters && filteredStores.length === 0) {
    return (
      <div className="screen2-container">
        <Filter
          onOpenModal={() => setModalOpen(true)}
          onChange={(filters) => {
            setShowMorrisons(filters.morrisons);
            setShowMorrisonsDaily(filters.morrisonsDaily);
          }}
          defaultValue={{
            morrisons: showMorrisons,
            morrisonsDaily: showMorrisonsDaily,
          }}
        />

        <div className="no-results">
          <h2>No stores match your criteria</h2>
          <p>None of the nearby stores match the selected filter.</p>
          <button
            className="btn-clear-filters"
            onClick={() => {
              setShowMorrisons(false);
              setShowMorrisonsDaily(false);
            }}
          >
            Clear Filters
          </button>
        </div>

        {modalOpen && (
          <FilterModal appliedFilters={appliedFilters} onChange={setAppliedFilters} onClose={() => setModalOpen(false)} />
        )}
      </div>
    );
  }

  // Stores found - show filter and results
  return (
    <div className="screen2-container">
      <Filter
        onOpenModal={() => setModalOpen(true)}
        onChange={(filters) => {
          setShowMorrisons(filters.morrisons);
          setShowMorrisonsDaily(filters.morrisonsDaily);
        }}
        defaultValue={{
          morrisons: showMorrisons,
          morrisonsDaily: showMorrisonsDaily,
        }}
      />

      {modalOpen && (
        <FilterModal appliedFilters={appliedFilters} onChange={setAppliedFilters} onClose={() => setModalOpen(false)} />
      )}

      {/* <div className="screen2-split-layout">
        <aside className="stores-list-section">
          <div className="stores-header">
            <h2 className="results-title">
              {effectiveSearchQuery ? (
                <span>Search Results for <span className="nearest-city">{effectiveSearchQuery}</span></span>
              ) : nearestCity ? (
                <span>Search Results for <span className="nearest-city">{nearestCity}</span></span>
              ) : (
                <span>Nearby Stores</span>
              )}
            </h2>
          </div>

             <ul className="stores-grid">
            {filteredStoresafterappliedfilters.map((store: any) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </ul>
        </aside>

        <section className="map-section" aria-label="Store map">
            {filteredStoresafterappliedfilters.length > 0 && (
              <StoreMap
                stores={filteredStoresafterappliedfilters}
                center={effectiveSearchCoordinates || undefined}
              />
            )}
        </section>
      </div> */}
      {filteredStoresafterappliedfilters.length > 0 ? (
  <div className="screen2-split-layout">
    <aside className="stores-list-section">
      <div className="stores-header">
        <h2 className="results-title">
          {effectiveSearchQuery ? (
            <span>Search Results for <span className="nearest-city">{effectiveSearchQuery}</span></span>
          ) : nearestCity ? (
            <span>Search Results for <span className="nearest-city">{nearestCity}</span></span>
          ) : (
            <span>Nearby Stores</span>
          )}
        </h2>
      </div>
      <ul className="stores-grid">
        {filteredStoresafterappliedfilters.map((store: any) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </ul>
    </aside>
    <section className="map-section" aria-label="Store map">
      <StoreMap
        stores={filteredStoresafterappliedfilters}
        center={effectiveSearchCoordinates || undefined}
      />
    </section>
  </div>
) : (
  <div className="no-results">
    <h2>No stores to display</h2>
    <p>Please try a different postcode or location.</p>
  </div>
)}

    </div>
  );
};

export default Screen2;