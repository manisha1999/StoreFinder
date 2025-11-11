import React, { useState, useMemo, useEffect } from 'react';
import StoreCard from '../StoreCard/StoreCard';
import './Screen2.css';
import StoreMap from '../StoreMap/StoreMap';
import Filter from '../Filters/Filter';
import FilterModal from '../FilterModal/FilterModal';
import useStoreDetails from '../../Hooks/useStoreDetails';
import { storeCache } from '../StoreCache/StoreCache';

interface Screen2Props {
  stores: any[];
  loading: boolean;
  error: string | null;
  searchQuery?: string;
  searchCoordinates?: { lat: number; lng: number } | null;
}


export interface StoreDetails {
  id: string | number;
  name?: string | number;
  storeName: string;
  address?: any;
  openingTimes?: any;
  departments?: any[];
  services?: any[];
  linkedStores?: any[];
  linkedLocations?: any[];
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

export const Screen2: React.FC<Screen2Props> = ({ 
  stores, 
  loading, 
  error,
  searchQuery, 
  searchCoordinates
}) => {
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



  ///. Applied Filters Logic 
  

  // Loading state
  if (loading) {
    return (
      <div className="screen2-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading stores...</p>
        </div>
      </div>
    );
  }

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
  if (!stores || stores.length === 0) {
    return searchQuery ? (
      <div className="screen2-container">
        <div className="no-results">
          <h2>No stores found</h2>
          <p>No stores found for "{searchQuery}"</p>
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
            morrisonsDaily: showMorrisonsDaily
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
          <FilterModal
            appliedFilters={appliedFilters}
            onChange={setAppliedFilters}
            onClose={() => setModalOpen(false)}
          />
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
          morrisonsDaily: showMorrisonsDaily
        }}
      />

      {modalOpen && (
        <FilterModal
          appliedFilters={appliedFilters}
          onChange={setAppliedFilters}
          onClose={() => setModalOpen(false)}
        />
      )}
      
      <div className="screen2-split-layout">
        <aside className="stores-list-section">
          <div className="stores-header">
            <h2 className="results-title">
              Nearby Stores <span className="store-count">({filteredStores.length})</span>
            </h2>
          </div>

          <ul className="stores-grid">
            {filteredStores.map((store: any) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </ul>
        </aside>

        <section className="map-section">
          <StoreMap 
            stores={filteredStores || []}
            center={searchCoordinates || undefined}
          />
        </section>
      </div>
    </div>
  );
};

export default Screen2;