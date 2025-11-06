import React from 'react';
import StoreCard from '../StoreCard/StoreCard';
import './Screen2.css';
import StoreMap from '../StoreMap/StoreMap';

interface Screen2Props {
  stores: any[];
  loading: boolean;
  error: string | null;
  searchQuery?: string;
  searchCoordinates?: { lat: number; lng: number } | null;
}

export const Screen2: React.FC<Screen2Props> = ({ 
  stores, 
  loading, 
  error,
  searchQuery, 
  searchCoordinates
}) => {
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

  if (error) {
    return (
      <div className="screen2-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="screen2-container">
      {/* Split layout: left = 30% (list), right = 70% (map) */}
      <div className="screen2-split-layout">
        <aside className="stores-list-section">
          <div className="stores-header">
            <h2 className="results-title">
              Nearby Stores <span className="store-count">({stores.length})</span>
            </h2>
          </div>

          <ul className="stores-grid">
            {stores.map((store: any) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </ul>
        </aside>

        <section className="map-section">
          <StoreMap 
            stores={stores || []}
            center={searchCoordinates || undefined}
          />
        </section>
      </div>
    </div>
  );
};

export default Screen2;