import "./Home.css"
import React, { useState, useEffect, useMemo } from 'react'
import SearchFeature from "../SearchFeature/SearchFeature"
import { useStoreSearch } from '../../Hooks/useStoreSearch';
// import {useNavigate} from 'react-router-dom'
import { Screen2 } from '../Screen2/Screen2';
import Footer from "../Footer/Footer"
import {NavBar} from "../NavBar/NavBar"
import logo from '../../logo.svg';

function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const {
    stores,
    loading,
    error,
    searchCoordinates: hookSearchCoordinates,
    searchStoresByPostcode,
    searchStoresByCurrentLocation,
  } = useStoreSearch();

  useEffect(() => {
    if (hookSearchCoordinates) {
      setSearchCoordinates({
        lat: hookSearchCoordinates.lat,
        lng: hookSearchCoordinates.lon,
      });
    }
  }, [hookSearchCoordinates]);

  const handleSearch = async (query: string, coordinates?: { lat: number; lng: number }) => {
    setSearchQuery(query);
    if (coordinates && query === 'Current Location') {
      setSearchCoordinates(coordinates);
      await searchStoresByCurrentLocation();
    } else if (query && query !== 'Current Location') {
      await searchStoresByPostcode(query);
    }
  };

  const showScreen = useMemo(
    () => loading || !!error || (stores && stores.length > 0),
    [loading, error, stores]
  );




  return (
    <div className="app-page">
      <header className="site-header" role="banner" aria-label="Global header">
        <NavBar />
      </header>

      <main className="site-main" role="main" aria-label="Store finder search and results">
         <img
              className="logo"
              src={logo}
              alt="Company logo"
              style={{ display: 'block', maxWidth: 100, width: '100%', height: 'auto' ,marginLeft:'100px'}}
            />
        <section className="main" aria-labelledby="store-search-heading">
          <div className="main_section">
            <h1 id="store-search-heading" className="visually-hidden">Find a store</h1>
             
            <SearchFeature onSearch={handleSearch} aria-label="Search feature" />

            {showScreen && (
              <Screen2
                stores={stores || []}
                loading={loading}
                error={error || null}
                searchQuery={searchQuery}
                searchCoordinates={searchCoordinates}
              />
            )}

            {/* Footer appears after Screen2 if it renders, otherwise right after SearchFeature */}
            <footer className="section-footer" role="contentinfo" aria-label="Footer">
              <Footer />
            </footer>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home