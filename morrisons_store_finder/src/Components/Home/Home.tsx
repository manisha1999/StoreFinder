import "./Home.css"
import React, { useState, useEffect } from 'react'
import SearchFeature from "../SearchFeature/SearchFeature"
import { useStoreSearch } from '../../Hooks/useStoreSearch';
import { Screen2 } from '../Screen2/Screen2';
import Footer from "../Footer/Footer"

function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  // Hook for store search
  const {
    stores,
    loading,
    error,
    searchCoordinates: hookSearchCoordinates,
    searchStoresByPostcode,
    searchStoresByCurrentLocation,
  } = useStoreSearch();

  // Sync hook coordinates with local state (convert lon to lng)
  useEffect(() => {
    if (hookSearchCoordinates) {
      setSearchCoordinates({
        lat: hookSearchCoordinates.lat,
        lng: hookSearchCoordinates.lon,
      });
    }
  }, [hookSearchCoordinates]);

  // Handle search from SearchFeature component
  const handleSearch = async (query: string, coordinates?: { lat: number; lng: number }) => {
    setSearchQuery(query);
    
    // If coordinates are provided directly (from current location button)
    if (coordinates && query === 'Current Location') {
      setSearchCoordinates(coordinates);
      await searchStoresByCurrentLocation();
    } 
    // Otherwise search by postcode/query
    else if (query && query !== 'Current Location') {
      await searchStoresByPostcode(query);
    }
  };

  return (
    <div> 
      <div>
        <section className="main">
          <div className="main_section">
            <SearchFeature onSearch={handleSearch} />
            <Screen2
              stores={stores || []}
              loading={loading}
              error={error || null}
              searchQuery={searchQuery}
              searchCoordinates={searchCoordinates}
            />
          </div>
        </section>
      </div>
      {/* <div className="footer"><Footer/></div> */}
    </div>
  )
}

export default Home